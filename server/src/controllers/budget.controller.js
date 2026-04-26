import { pool } from "../db.js";

const ALLOWED_CATEGORIES = new Set(["transport", "hotel", "food", "ticket", "other"]);

async function userOwnsTrip(tripId, userId) {
  const [rows] = await pool.query("SELECT id FROM trips WHERE id = ? AND user_id = ? AND deleted_at IS NULL LIMIT 1", [
    tripId,
    userId
  ]);
  return rows.length > 0;
}

export async function getBudget(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);
    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ message: "Invalid trip id" });
    }
    if (!(await userOwnsTrip(tripId, req.user.id))) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const [rows] = await pool.query("SELECT id, trip_id, total_budget, currency, created_at FROM budgets WHERE trip_id = ?", [
      tripId
    ]);

    if (rows.length === 0) {
      return res.status(200).json(null);
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return next(error);
  }
}

export async function upsertBudget(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);
    const { totalBudget, currency } = req.body;

    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ message: "Invalid trip id" });
    }
    if (typeof totalBudget !== "number" || totalBudget < 0) {
      return res.status(400).json({ message: "totalBudget must be a non-negative number" });
    }
    if (!(await userOwnsTrip(tripId, req.user.id))) {
      return res.status(404).json({ message: "Trip not found" });
    }

    await pool.query(
      `INSERT INTO budgets (trip_id, total_budget, currency)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE total_budget = VALUES(total_budget), currency = VALUES(currency)`,
      [tripId, totalBudget, currency || "IDR"]
    );

    const [rows] = await pool.query("SELECT id, trip_id, total_budget, currency, created_at FROM budgets WHERE trip_id = ?", [
      tripId
    ]);

    return res.status(200).json(rows[0]);
  } catch (error) {
    return next(error);
  }
}

export async function getExpenses(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);
    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ message: "Invalid trip id" });
    }
    if (!(await userOwnsTrip(tripId, req.user.id))) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const [rows] = await pool.query(
      `SELECT id, trip_id, category, title, amount, expense_date, notes, created_at
       FROM expenses
       WHERE trip_id = ?
       ORDER BY created_at DESC`,
      [tripId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
}

export async function createExpense(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);
    const { category, title, amount, expenseDate, notes } = req.body;

    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ message: "Invalid trip id" });
    }
    if (!ALLOWED_CATEGORIES.has(category)) {
      return res.status(400).json({ message: "Invalid expense category" });
    }
    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }
    if (typeof amount !== "number" || amount < 0) {
      return res.status(400).json({ message: "amount must be a non-negative number" });
    }
    if (!(await userOwnsTrip(tripId, req.user.id))) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const [result] = await pool.query(
      "INSERT INTO expenses (trip_id, category, title, amount, expense_date, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [tripId, category, title, amount, expenseDate || null, notes || null]
    );

    return res.status(201).json({
      id: result.insertId,
      tripId,
      category,
      title,
      amount,
      expenseDate: expenseDate || null,
      notes: notes || null
    });
  } catch (error) {
    return next(error);
  }
}
