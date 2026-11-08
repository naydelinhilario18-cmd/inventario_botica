import { Router } from "express";
import { database } from "../config/database.js";

const router = Router();

router.get("/", async (_request, response, next) => {
  try {
    const [[summary]] = await database.execute(
      `SELECT
        (SELECT COUNT(*) FROM products) AS products,
        (SELECT COUNT(*) FROM clients) AS clients,
        (SELECT COUNT(*) FROM products WHERE stock <= min_stock) AS low_stock,
        (SELECT COUNT(*) FROM sales WHERE DATE(created_at) = CURDATE()) AS sales_today,
        (SELECT COALESCE(SUM(total), 0) FROM sales WHERE DATE(created_at) = CURDATE()) AS revenue_today`,
    );
    const [recentSales] = await database.execute(
      `SELECT s.id, s.total, s.created_at, COALESCE(c.name, 'Venta general') AS client_name
       FROM sales s LEFT JOIN clients c ON c.id = s.client_id
       ORDER BY s.created_at DESC LIMIT 5`,
    );
    const [lowStock] = await database.execute(
      `SELECT id, name, sku, stock, min_stock FROM products
       WHERE stock <= min_stock ORDER BY stock ASC, name LIMIT 8`,
    );
    return response.json({ summary, recentSales, lowStock });
  } catch (error) {
    return next(error);
  }
});

router.get("/reports", async (request, response, next) => {
  try {
    const days = Number(request.query.days ?? 7);
    if (![7, 30, 90].includes(days)) {
      return response.status(400).json({ error: "El periodo debe ser de 7, 30 o 90 días." });
    }
    const [daily] = await database.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS sales,
              COALESCE(SUM(total), 0) AS revenue
       FROM sales WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') ORDER BY day`,
      [days - 1],
    );
    const [topProducts] = await database.execute(
      `SELECT si.product_name AS name, SUM(si.quantity) AS quantity,
              SUM(si.subtotal) AS revenue
       FROM sale_items si JOIN sales s ON s.id = si.sale_id
       WHERE s.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY si.product_id, si.product_name
       ORDER BY quantity DESC LIMIT 10`,
      [days - 1],
    );
    return response.json({ daily, topProducts });
  } catch (error) {
    return next(error);
  }
});

router.get("/alerts", async (_request, response, next) => {
  try {
    const [products] = await database.execute(
      `SELECT id, name, category, sku, stock, min_stock,
              DATE_FORMAT(expiration_date, '%Y-%m-%d') AS expiration_date
       FROM products WHERE stock <= min_stock OR expiration_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
       ORDER BY (stock <= min_stock) DESC, stock ASC, expiration_date ASC`,
    );
    return response.json(products);
  } catch (error) {
    return next(error);
  }
});

export default router;
