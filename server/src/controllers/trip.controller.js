import { pool } from "../db.js";

export async function getTrips(_req, res, next) {
  try {
    const [rows] = await pool.query("SELECT id, name, destination, start_date, end_date FROM trips ORDER BY id DESC");
    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
}

export async function createTrip(req, res, next) {
  try {
    const { name, destination, startDate, endDate } = req.body;

    const [result] = await pool.query(
      "INSERT INTO trips (name, destination, start_date, end_date) VALUES (?, ?, ?, ?)",
      [name, destination, startDate || null, endDate || null]
    );

    return res.status(201).json({
      id: result.insertId,
      name,
      destination,
      startDate: startDate || null,
      endDate: endDate || null
    });
  } catch (error) {
    return next(error);
  }
}
