import { pool } from "../db.js";

export async function getTrips(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, name, destination, start_date, end_date, notes, created_at, deleted_at
       FROM trips
       WHERE user_id = ? AND deleted_at IS NULL
       ORDER BY id DESC`,
      [req.user.id]
    );
    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
}

export async function getTripHistory(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, name, destination, start_date, end_date, notes, created_at, deleted_at
       FROM trips
       WHERE user_id = ? AND deleted_at IS NOT NULL
       ORDER BY deleted_at DESC, id DESC`,
      [req.user.id]
    );
    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
}

export async function createTrip(req, res, next) {
  let conn;
  try {
    const { name, destination, startDate, endDate, notes, totalBudget, currency } = req.body;

    if (!name || !destination) {
      return res.status(400).json({ message: "name and destination are required" });
    }

    if (typeof totalBudget !== "undefined" && totalBudget !== null) {
      if (typeof totalBudget !== "number" || totalBudget < 0) {
        return res.status(400).json({ message: "totalBudget must be a non-negative number" });
      }
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [result] = await conn.query(
      "INSERT INTO trips (user_id, name, destination, start_date, end_date, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.id, name, destination, startDate || null, endDate || null, notes || null]
    );

    if (typeof totalBudget === "number" && totalBudget >= 0) {
      await conn.query("INSERT INTO budgets (trip_id, total_budget, currency) VALUES (?, ?, ?)", [
        result.insertId,
        totalBudget,
        currency || "IDR"
      ]);
    }

    await conn.commit();

    return res.status(201).json({
      id: result.insertId,
      userId: req.user.id,
      name,
      destination,
      startDate: startDate || null,
      endDate: endDate || null,
      notes: notes || null,
      totalBudget: typeof totalBudget === "number" && totalBudget >= 0 ? totalBudget : null,
      currency: currency || "IDR"
    });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    return next(error);
  } finally {
    if (conn) {
      conn.release();
    }
  }
}

export async function getTripById(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);
    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ message: "Invalid trip id" });
    }

    const [rows] = await pool.query(
      `SELECT id, user_id, name, destination, start_date, end_date, notes, created_at, deleted_at
       FROM trips
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL
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

    const [result] = await pool.query(
      "UPDATE trips SET deleted_at = NOW() WHERE id = ? AND user_id = ? AND deleted_at IS NULL",
      [tripId, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.status(200).json({
      message: "Trip moved to history"
    });
  } catch (error) {
    return next(error);
  }
}
