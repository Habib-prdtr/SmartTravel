import { pool } from "../db.js";

async function userOwnsTrip(tripId, userId) {
  const [rows] = await pool.query("SELECT id FROM trips WHERE id = ? AND user_id = ? AND deleted_at IS NULL LIMIT 1", [
    tripId,
    userId
  ]);
  return rows.length > 0;
}

async function findTripDay(dayId, tripId) {
  const [rows] = await pool.query(
    "SELECT id, trip_id, day_number, date, created_at FROM itinerary_days WHERE id = ? AND trip_id = ? LIMIT 1",
    [dayId, tripId]
  );
  return rows[0] || null;
}

export async function getItineraryDays(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);
    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ message: "Invalid trip id" });
    }

    if (!(await userOwnsTrip(tripId, req.user.id))) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const [rows] = await pool.query(
      "SELECT id, trip_id, day_number, date, created_at FROM itinerary_days WHERE trip_id = ? ORDER BY day_number ASC",
      [tripId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
}

export async function createItineraryDay(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);
    const { dayNumber, date } = req.body;

    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ message: "Invalid trip id" });
    }
    if (!Number.isInteger(dayNumber) || dayNumber <= 0) {
      return res.status(400).json({ message: "dayNumber must be a positive integer" });
    }
    if (!(await userOwnsTrip(tripId, req.user.id))) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const [result] = await pool.query("INSERT INTO itinerary_days (trip_id, day_number, date) VALUES (?, ?, ?)", [
      tripId,
      dayNumber,
      date || null
    ]);

    return res.status(201).json({
      id: result.insertId,
      tripId,
      dayNumber,
      date: date || null
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "dayNumber already exists for this trip" });
    }
    return next(error);
  }
}

export async function updateItineraryDay(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);
    const dayId = Number(req.params.dayId);
    const { dayNumber, date } = req.body;

    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ message: "Invalid trip id" });
    }
    if (!Number.isInteger(dayId) || dayId <= 0) {
      return res.status(400).json({ message: "Invalid day id" });
    }
    if (!(await userOwnsTrip(tripId, req.user.id))) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const existingDay = await findTripDay(dayId, tripId);
    if (!existingDay) {
      return res.status(404).json({ message: "Itinerary day not found" });
    }

    const nextDayNumber = Number.isInteger(dayNumber) && dayNumber > 0 ? dayNumber : existingDay.day_number;
    const nextDate = typeof date === "undefined" ? existingDay.date : date || null;

    await pool.query("UPDATE itinerary_days SET day_number = ?, date = ? WHERE id = ? AND trip_id = ?", [
      nextDayNumber,
      nextDate,
      dayId,
      tripId
    ]);

    const updatedDay = await findTripDay(dayId, tripId);
    return res.status(200).json(updatedDay);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "dayNumber already exists for this trip" });
    }
    return next(error);
  }
}

export async function getItineraryItems(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);
    const dayId = Number(req.params.dayId);

    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ message: "Invalid trip id" });
    }
    if (!Number.isInteger(dayId) || dayId <= 0) {
      return res.status(400).json({ message: "Invalid day id" });
    }
    if (!(await userOwnsTrip(tripId, req.user.id))) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const existingDay = await findTripDay(dayId, tripId);
    if (!existingDay) {
      return res.status(404).json({ message: "Itinerary day not found" });
    }

    const [rows] = await pool.query(
      `SELECT id, itinerary_day_id, title, location_name, start_time, end_time, activity_type, notes, sort_order, created_at
       FROM itinerary_items
       WHERE itinerary_day_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [dayId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({ message: "Table itinerary_items not found. Please run latest schema update." });
    }
    return next(error);
  }
}

export async function createItineraryItem(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);
    const dayId = Number(req.params.dayId);
    const { title, locationName, startTime, endTime, activityType, notes, sortOrder } = req.body;

    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ message: "Invalid trip id" });
    }
    if (!Number.isInteger(dayId) || dayId <= 0) {
      return res.status(400).json({ message: "Invalid day id" });
    }
    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "title is required" });
    }
    if (!(await userOwnsTrip(tripId, req.user.id))) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const existingDay = await findTripDay(dayId, tripId);
    if (!existingDay) {
      return res.status(404).json({ message: "Itinerary day not found" });
    }

    const [result] = await pool.query(
      `INSERT INTO itinerary_items
      (itinerary_day_id, title, location_name, start_time, end_time, activity_type, notes, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dayId,
        title.trim(),
        locationName?.trim() || null,
        startTime || null,
        endTime || null,
        activityType || "sightseeing",
        notes?.trim() || null,
        Number.isInteger(sortOrder) ? sortOrder : 0
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, itinerary_day_id, title, location_name, start_time, end_time, activity_type, notes, sort_order, created_at
       FROM itinerary_items
       WHERE id = ? LIMIT 1`,
      [result.insertId]
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({ message: "Table itinerary_items not found. Please run latest schema update." });
    }
    return next(error);
  }
}

export async function updateItineraryItem(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);
    const dayId = Number(req.params.dayId);
    const itemId = Number(req.params.itemId);
    const { title, locationName, startTime, endTime, activityType, notes, sortOrder } = req.body;

    if (!Number.isInteger(tripId) || tripId <= 0) return res.status(400).json({ message: "Invalid trip id" });
    if (!Number.isInteger(dayId) || dayId <= 0) return res.status(400).json({ message: "Invalid day id" });
    if (!Number.isInteger(itemId) || itemId <= 0) return res.status(400).json({ message: "Invalid item id" });
    if (!title || typeof title !== "string") return res.status(400).json({ message: "title is required" });

    if (!(await userOwnsTrip(tripId, req.user.id))) return res.status(404).json({ message: "Trip not found" });

    const existingDay = await findTripDay(dayId, tripId);
    if (!existingDay) return res.status(404).json({ message: "Itinerary day not found" });

    const [result] = await pool.query(
      `UPDATE itinerary_items
       SET title = ?, location_name = ?, start_time = ?, end_time = ?, activity_type = ?, notes = ?, sort_order = ?
       WHERE id = ? AND itinerary_day_id = ?`,
      [
        title.trim(),
        locationName?.trim() || null,
        startTime || null,
        endTime || null,
        activityType || "sightseeing",
        notes?.trim() || null,
        Number.isInteger(sortOrder) ? sortOrder : 0,
        itemId,
        dayId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Itinerary item not found" });
    }

    const [rows] = await pool.query(
      `SELECT id, itinerary_day_id, title, location_name, start_time, end_time, activity_type, notes, sort_order, created_at
       FROM itinerary_items WHERE id = ? LIMIT 1`,
      [itemId]
    );

    return res.status(200).json(rows[0]);
  } catch (error) {
    return next(error);
  }
}

export async function deleteItineraryItem(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);
    const dayId = Number(req.params.dayId);
    const itemId = Number(req.params.itemId);

    if (!Number.isInteger(tripId) || tripId <= 0) return res.status(400).json({ message: "Invalid trip id" });
    if (!Number.isInteger(dayId) || dayId <= 0) return res.status(400).json({ message: "Invalid day id" });
    if (!Number.isInteger(itemId) || itemId <= 0) return res.status(400).json({ message: "Invalid item id" });

    if (!(await userOwnsTrip(tripId, req.user.id))) return res.status(404).json({ message: "Trip not found" });

    const existingDay = await findTripDay(dayId, tripId);
    if (!existingDay) return res.status(404).json({ message: "Itinerary day not found" });

    const [result] = await pool.query(
      "DELETE FROM itinerary_items WHERE id = ? AND itinerary_day_id = ?",
      [itemId, dayId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Itinerary item not found" });
    }

    return res.status(200).json({ message: "Itinerary item deleted" });
  } catch (error) {
    return next(error);
  }
}
