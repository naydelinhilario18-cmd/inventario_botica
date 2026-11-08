import { Router } from "express";
import { database } from "../config/database.js";

const router = Router();

router.get("/", async (_request, response, next) => {
  try {
    const [sales] = await database.execute(
      `SELECT s.id, s.total, s.created_at, c.name AS client_name, u.name AS seller_name,
              (SELECT COUNT(*) FROM sale_items si WHERE si.sale_id = s.id) AS item_count
       FROM sales s JOIN users u ON u.id = s.user_id
       LEFT JOIN clients c ON c.id = s.client_id
       ORDER BY s.created_at DESC LIMIT 200`,
    );
    return response.json(sales);
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/items", async (request, response, next) => {
  try {
    const [items] = await database.execute(
      "SELECT product_name, quantity, unit_price, subtotal FROM sale_items WHERE sale_id = ?",
      [request.params.id],
    );
    return response.json(items);
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (request, response, next) => {
  const entries = request.body.items;
  if (!Array.isArray(entries) || entries.length === 0 || entries.length > 100) {
    return response.status(400).json({ error: "Agrega al menos un producto a la venta." });
  }
  const quantities = new Map();
  for (const entry of entries) {
    const id = Number(entry.product_id);
    const quantity = Number(entry.quantity);
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(quantity) || quantity < 1) {
      return response.status(400).json({ error: "Cada producto debe tener una cantidad válida." });
    }
    quantities.set(id, (quantities.get(id) ?? 0) + quantity);
  }

  let connection;
  try {
    connection = await database.getConnection();
    await connection.beginTransaction();
    const saleItems = [];
    let total = 0;
    for (const [productId, quantity] of quantities) {
      const [products] = await connection.execute(
        "SELECT id, name, price, stock FROM products WHERE id = ? FOR UPDATE",
        [productId],
      );
      const product = products[0];
      if (!product) {
        await connection.rollback();
        return response.status(404).json({ error: "Uno de los productos no existe." });
      }
      if (product.stock < quantity) {
        await connection.rollback();
        return response.status(409).json({
          error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}.`,
        });
      }
      const subtotal = Math.round(product.price * quantity * 100) / 100;
      total += subtotal;
      saleItems.push({ ...product, quantity, subtotal });
    }

    const clientId = request.body.client_id ? Number(request.body.client_id) : null;
    if (clientId && !Number.isInteger(clientId)) {
      await connection.rollback();
      return response.status(400).json({ error: "Cliente inválido." });
    }
    const [sale] = await connection.execute(
      "INSERT INTO sales (user_id, client_id, total) VALUES (?, ?, ?)",
      [request.user.id, clientId, total],
    );
    for (const item of saleItems) {
      await connection.execute(
        `INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sale.insertId, item.id, item.name, item.quantity, item.price, item.subtotal],
      );
      await connection.execute("UPDATE products SET stock = stock - ? WHERE id = ?", [
        item.quantity,
        item.id,
      ]);
    }
    await connection.commit();
    return response.status(201).json({ id: sale.insertId, total });
  } catch (error) {
    if (connection) await connection.rollback();
    return next(error);
  } finally {
    connection?.release();
  }
});

export default router;
