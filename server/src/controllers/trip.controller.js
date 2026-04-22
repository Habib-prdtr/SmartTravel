import { pool } from "../db.js";

export async function getTrips(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, name, destination, start_date, end_date, notes, created_at
       FROM trips
       WHERE user_id = ?
       ORDER BY id DESC`,
      [req.user.id]
    );
    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
}

export async function createTrip(req, res, next) {
  try {
    const { name, destination, startDate, endDate, notes } = req.body;

    if (!name || !destination) {
      return res.status(400).json({ message: "name and destination are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO trips (user_id, name, destination, start_date, end_date, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.id, name, destination, startDate || null, endDate || null, notes || null]
    );

    return res.status(201).json({
      id: result.insertId,
      userId: req.user.id,
      name,
      destination,
      startDate: startDate || null,
      endDate: endDate || null,
      notes: notes || null
    });
  } catch (error) {
    return next(error);
  }
}

export async function getTripById(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);
    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ message: "Invalid trip id" });
    }

    const [rows] = await pool.query(
      `SELECT id, user_id, name, destination, start_date, end_date, notes, created_at
       FROM trips
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [tripId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return next(error);
  }
}

export async function deleteTrip(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);
    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ message: "Invalid trip id" });
    }

    const [result] = await pool.query("DELETE FROM trips WHERE id = ? AND user_id = ?", [tripId, req.user.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.status(200).json({
      message: "Trip deleted"
    });
  } catch (error) {
    return next(error);
  }
}
