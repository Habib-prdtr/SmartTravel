import { pool } from "./src/db.js";

async function run() {
  try {
    console.log("Adding columns to users table...");
    await pool.query("ALTER TABLE users ADD COLUMN hobby VARCHAR(255) DEFAULT NULL");
    await pool.query("ALTER TABLE users ADD COLUMN dietary_preferences VARCHAR(255) DEFAULT NULL");
    await pool.query("ALTER TABLE users ADD COLUMN emergency_contact VARCHAR(255) DEFAULT NULL");
    console.log("Success! Added columns to users.");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Columns already exist in users.");
    } else {
      console.error(err);
    }
  }

  try {
    console.log("Removing hobby from trips table...");
    await pool.query("ALTER TABLE trips DROP COLUMN hobby");
    console.log("Success! Removed hobby from trips.");
  } catch (err) {
    if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
      console.log("Column hobby does not exist in trips.");
    } else {
      console.error(err);
    }
  }

  process.exit(0);
}

run();
