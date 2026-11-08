import { Router } from "express";
import { database } from "../config/database.js";

const router = Router();

router.get("/", async (request, response, next) => {
  try {
    const search = `%${String(request.query.search ?? "").trim().slice(0, 100)}%`;
    const [products] = await database.execute(
      `SELECT id, name, category, sku, price, stock, min_stock,
              DATE_FORMAT(expiration_date, '%Y-%m-%d') AS expiration_date, created_at
       FROM products WHERE name LIKE ? OR sku LIKE ? OR category LIKE ?
       ORDER BY name LIMIT 500`,
      [search, search, search],
    );
    return response.json(products);
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const { name, category = "General", sku, price, stock, min_stock = 5, expiration_date = null } = request.body;
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedMin = Number(min_stock);
    if (!String(name ?? "").trim() || String(name).trim().length > 160 ||
        !String(sku ?? "").trim() || String(sku).trim().length > 64 ||
        !Number.isFinite(parsedPrice) || parsedPrice <= 0 ||
        !Number.isInteger(parsedStock) || parsedStock < 0 ||
        !Number.isInteger(parsedMin) || parsedMin < 0 ||
        (expiration_date && !/^\d{4}-\d{2}-\d{2}$/.test(expiration_date))) {
      return response.status(400).json({ error: "Revisa nombre, SKU, precio, existencias y stock mínimo." });
    }
    const [result] = await database.execute(
      `INSERT INTO products (name, category, sku, price, stock, min_stock, expiration_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [String(name).trim(), String(category).trim().slice(0, 100) || "General",
        String(sku).trim(), parsedPrice, parsedStock, parsedMin, expiration_date || null],
    );
    return response.status(201).json({ id: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return response.status(409).json({ error: "Ya existe un producto con ese SKU." });
    }
    return next(error);
  }
});

router.put("/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    const { name, category, sku, price, stock, min_stock, expiration_date = null } = request.body;
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedMin = Number(min_stock);
    if (!Number.isInteger(id) || id < 1 || !String(name ?? "").trim() ||
        !String(sku ?? "").trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0 ||
        !Number.isInteger(parsedStock) || parsedStock < 0 ||
        !Number.isInteger(parsedMin) || parsedMin < 0 ||
        (expiration_date && !/^\d{4}-\d{2}-\d{2}$/.test(expiration_date))) {
      return response.status(400).json({ error: "Revisa los datos del producto." });
    }
    const [result] = await database.execute(
      `UPDATE products SET name = ?, category = ?, sku = ?, price = ?, stock = ?,
       min_stock = ?, expiration_date = ? WHERE id = ?`,
      [String(name).trim(), String(category ?? "General").trim().slice(0, 100) || "General",
        String(sku).trim(), parsedPrice, parsedStock, parsedMin, expiration_date || null, id],
    );
    if (!result.affectedRows) return response.status(404).json({ error: "Producto no encontrado." });
    return response.json({ message: "Producto actualizado." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return response.status(409).json({ error: "Ya existe un producto con ese SKU." });
    }
    return next(error);
  }
});

router.delete("/:id", async (request, response, next) => {
  try {
    const [result] = await database.execute("DELETE FROM products WHERE id = ?", [request.params.id]);
    if (!result.affectedRows) return response.status(404).json({ error: "Producto no encontrado." });
    return response.status(204).end();
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return response.status(409).json({ error: "No se puede eliminar un producto que ya tiene ventas." });
    }
    return next(error);
  }
});

export default router;
