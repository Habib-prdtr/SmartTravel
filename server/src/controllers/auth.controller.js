import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    process.env.JWT_SECRET || "dev_only_change_me",
    { expiresIn: "7d" }
  );
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", [
      name,
      email,
      passwordHash
    ]);

    const user = {
      id: result.insertId,
      name,
      email
    };

    const token = createToken(user);
    return res.status(201).json({ token, user });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const [rows] = await pool.query("SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const foundUser = rows[0];
    const passwordMatch = await bcrypt.compare(password, foundUser.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email
    };

    const token = createToken(user);
    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT id, name, email, created_at, updated_at FROM users WHERE id = ? LIMIT 1", [
      req.user.id
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return next(error);
  }
}
