// @ts-nocheck
import { pool } from "../db.js";
import { z } from "zod";

const createTripSchema = z.object({
  name: z.string().min(2, "Nama trip minimal 2 karakter").max(120),
  destination: z.string().min(2, "Destinasi minimal 2 karakter").max(120),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  totalBudget: z.number().min(0, "Budget tidak boleh negatif").optional().nullable(),
  currency: z.string().length(3, "Kode mata uang harus 3 huruf").optional().nullable()
});

const updateTripSchema = z.object({
  name: z.string().min(2, "Nama trip minimal 2 karakter").max(120),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable()
});

export async function getTrips(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, name, destination, start_date, end_date, notes, weather_prediction, packing_list, created_at, deleted_at
       FROM trips
       WHERE user_id = ? AND deleted_at IS NULL
       ORDER BY start_date ASC`,
      [req.user.id]
    );
    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
}

export async function getTripHistory(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT id, user_id, name, destination, start_date, end_date, notes, created_at, deleted_at
       FROM trips
       WHERE user_id = ? AND deleted_at IS NOT NULL
       ORDER BY deleted_at DESC, id DESC
       LIMIT ${limit} OFFSET ${offset}`,
      [req.user.id]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(id) as total FROM trips WHERE user_id = ? AND deleted_at IS NOT NULL`,
      [req.user.id]
    );
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      data: rows,
      meta: { page, limit, total, totalPages }
    });
  } catch (error) {
    return next(error);
  }
}

export async function createTrip(req, res, next) {
  let conn;
  try {
    const parseResult = createTripSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message });
    }
    const { name, destination, startDate, endDate, notes, totalBudget, currency } = parseResult.data;

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
      `SELECT id, user_id, name, destination, start_date, end_date, notes, weather_prediction, packing_list, created_at, deleted_at
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

export async function updateTrip(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);
    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ message: "Invalid trip id" });
    }

    const parseResult = updateTripSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message });
    }
    const { name, startDate, endDate } = parseResult.data;

    const [result] = await pool.query(
      "UPDATE trips SET name = ?, start_date = ?, end_date = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL",
      [name, startDate || null, endDate || null, tripId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.status(200).json({
      message: "Trip updated successfully",
      id: tripId,
      name,
      startDate: startDate || null,
      endDate: endDate || null
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteTripPermanent(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);
    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ message: "Invalid trip id" });
    }

    const [result] = await pool.query(
      "DELETE FROM trips WHERE id = ? AND user_id = ?",
      [tripId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.status(200).json({
      message: "Trip permanently deleted"
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAllHistory(req, res, next) {
  try {
    const [result] = await pool.query(
      "DELETE FROM trips WHERE user_id = ? AND deleted_at IS NOT NULL",
      [req.user.id]
    );

    return res.status(200).json({
      message: "All history cleared",
      deletedCount: result.affectedRows
    });
  } catch (error) {
    return next(error);
  }
}

