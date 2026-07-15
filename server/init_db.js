import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function initDatabase() {
  console.log("Menginisialisasi koneksi database ke Clever Cloud...");
  
  // Create connection with multipleStatements enabled to run the whole schema.sql
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    const schemaPath = path.join(__dirname, "sql", "schema.sql");
    console.log(`Membaca file SQL: ${schemaPath}`);
    const sqlContent = fs.readFileSync(schemaPath, "utf8");

    console.log("Sedang membuat tabel di Clever Cloud...");
    await connection.query(sqlContent);
    console.log("✅ Inisialisasi Database Sukses! Semua tabel berhasil dibuat.");
  } catch (error) {
    console.error("❌ Gagal menginisialisasi database:", error.message);
  } finally {
    await connection.end();
  }
}

initDatabase();
