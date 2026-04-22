import { pool } from "../db.js";

async function userOwnsTrip(tripId, userId) {
  const [rows] = await pool.query("SELECT id FROM trips WHERE id = ? AND user_id = ? LIMIT 1", [tripId, userId]);
  return rows.length > 0;
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
