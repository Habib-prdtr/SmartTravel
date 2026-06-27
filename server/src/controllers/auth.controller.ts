// @ts-nocheck
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../db.js";

// Skema Validasi Input
const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter").max(255),
});

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Format email tidak valid"),
  hobby: z.string().optional().nullable(),
  dietary_preferences: z.string().optional().nullable(),
  emergency_contact: z.string().optional().nullable(),
});

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
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message });
    }
    
    const { name, email, password } = parseResult.data;

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
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message });
    }

    const { email, password } = parseResult.data;

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
      // Note: Full user data will be fetched by /me endpoint
    };

    const token = createToken(user);
    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT id, name, email, hobby, dietary_preferences, emergency_contact, created_at, updated_at FROM users WHERE id = ? LIMIT 1", [
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

export async function updateProfile(req, res, next) {
  try {
    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message });
    }

    const { name, email, hobby, dietary_preferences, emergency_contact } = parseResult.data;
    const userId = req.user.id;

    // Check if new email is already used by another user
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1", [email, userId]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already in use by another account" });
    }

    // Update user
    await pool.query(
      "UPDATE users SET name = ?, email = ?, hobby = ?, dietary_preferences = ?, emergency_contact = ? WHERE id = ?", 
      [name, email, hobby || null, dietary_preferences || null, emergency_contact || null, userId]
    );

    const updatedUser = {
      id: userId,
      name,
      email,
      hobby: hobby || null,
      dietary_preferences: dietary_preferences || null,
      emergency_contact: emergency_contact || null
    };

    // Issue a new token with updated payload
    const token = createToken(updatedUser);
    
    return res.status(200).json({ token, user: updatedUser });
  } catch (error) {
    return next(error);
  }
}
