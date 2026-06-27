import { pool } from "./src/db.js";

async function run() {
  try {
    const userId = 1;
    const limit = 5;
    const offset = 0;
    
    console.log("Running query...");
    const [rows] = await pool.query(
      `SELECT id, user_id, name, destination, start_date, end_date, notes, created_at, deleted_at
       FROM trips
       WHERE user_id = ? AND deleted_at IS NOT NULL
       ORDER BY deleted_at DESC, id DESC
       LIMIT ${limit} OFFSET ${offset}`,
      [userId]
    );
    console.log("Query 1 success:", rows.length);
    
    const [countRows] = await pool.query(
      `SELECT COUNT(id) as total FROM trips WHERE user_id = ? AND deleted_at IS NOT NULL`,
      [userId]
    );
    console.log("Query 2 success:", countRows[0].total);
  } catch (error) {
    console.error("ERROR CAUGHT:", error);
  } finally {
    process.exit(0);
  }
}

run();
