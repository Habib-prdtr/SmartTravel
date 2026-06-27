import { pool } from "./src/db.js";

async function run() {
  try {
    console.log("Connected");
    await pool.query('ALTER TABLE trips ADD COLUMN weather_prediction TEXT, ADD COLUMN packing_list JSON;');
    console.log("Columns added!");
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("Columns already exist");
      process.exit(0);
    }
    console.error(error);
    process.exit(1);
  }
}

run();
