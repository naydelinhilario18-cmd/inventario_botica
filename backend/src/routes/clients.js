import { Router } from "express";
import { database } from "../config/database.js";

const router = Router();

router.get("/", async (request, response, next) => {
  try {
    const search = `%${String(request.query.search ?? "").trim().slice(0, 100)}%`;
    const [clients] = await database.execute(
      `SELECT id, name, document, phone, email, created_at FROM clients
       WHERE name LIKE ? OR COALESCE(document, '') LIKE ? ORDER BY name LIMIT 500`,
      [search, search],
    );
    return response.json(clients);
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const { name, document = null, phone = null, email = null } = request.body;
    if (!String(name ?? "").trim() || String(name).trim().length > 160 ||
        (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return response.status(400).json({ error: "Ingresa un nombre y un correo válido." });
    }
    const [result] = await database.execute(
      "INSERT INTO clients (name, document, phone, email) VALUES (?, ?, ?, ?)",
      [String(name).trim(), document ? String(document).trim().slice(0, 32) : null,
        phone ? String(phone).trim().slice(0, 32) : null,
        email ? String(email).trim().slice(0, 190).toLowerCase() : null],
    );
    return response.status(201).json({ id: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return response.status(409).json({ error: "Ya existe un cliente con ese documento." });
    }
    return next(error);
  }
});

router.put("/:id", async (request, response, next) => {
  try {
    const { name, document = null, phone = null, email = null } = request.body;
    if (!String(name ?? "").trim() ||
        (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return response.status(400).json({ error: "Ingresa un nombre y un correo válido." });
    }
    const [result] = await database.execute(
      "UPDATE clients SET name = ?, document = ?, phone = ?, email = ? WHERE id = ?",
      [String(name).trim(), document ? String(document).trim().slice(0, 32) : null,
        phone ? String(phone).trim().slice(0, 32) : null,
        email ? String(email).trim().slice(0, 190).toLowerCase() : null, request.params.id],
    );
    if (!result.affectedRows) return response.status(404).json({ error: "Cliente no encontrado." });
    return response.json({ message: "Cliente actualizado." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return response.status(409).json({ error: "Ya existe un cliente con ese documento." });
    }
    return next(error);
  }
});

export default router;
