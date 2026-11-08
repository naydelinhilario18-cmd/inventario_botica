import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { database } from "../config/database.js";
import { authenticate, jwtSecret, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (request, response, next) => {
  try {
    const email = String(request.body.email ?? "").trim().toLowerCase();
    const password = String(request.body.password ?? "");
    if (!email || !password || email.length > 190 || password.length > 128) {
      return response.status(400).json({ error: "Ingresa un correo y contraseña válidos." });
    }

    const [users] = await database.execute(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
      [email],
    );
    const user = users[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return response.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    const profile = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(profile, jwtSecret, { expiresIn: "8h" });
    return response.json({ token, user: profile });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", authenticate, (request, response) => {
  response.json({ user: request.user });
});

router.get("/users", authenticate, requireAdmin, async (_request, response, next) => {
  try {
    const [users] = await database.execute(
      "SELECT id, name, email, role, created_at FROM users ORDER BY name",
    );
    return response.json(users);
  } catch (error) {
    return next(error);
  }
});

router.post("/users", authenticate, requireAdmin, async (request, response, next) => {
  try {
    const { name, email, password, role = "staff" } = request.body;
    const normalizedEmail = String(email ?? "").trim().toLowerCase();
    if (!String(name ?? "").trim() || String(name).trim().length > 120 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
        !/^(admin|staff)$/.test(role) || String(password ?? "").length < 8) {
      return response.status(400).json({
        error: "Completa un nombre, correo válido, rol y contraseña de al menos 8 caracteres.",
      });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await database.execute(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [String(name).trim(), normalizedEmail, hash, role],
    );
    return response.status(201).json({
      id: result.insertId,
      name: String(name).trim(),
      email: normalizedEmail,
      role,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return response.status(409).json({ error: "Ya existe un usuario con ese correo." });
    }
    return next(error);
  }
});

export default router;
