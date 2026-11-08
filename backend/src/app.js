import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { authenticate } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/clients.js";
import dashboardRoutes from "./routes/dashboard.js";
import productRoutes from "./routes/products.js";
import salesRoutes from "./routes/sales.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
}));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }), authRoutes);
app.use("/api", authenticate);
app.use("/api/products", productRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api", dashboardRoutes);

app.use((error, _request, response, _next) => {
  if (error.type === "entity.parse.failed") {
    return response.status(400).json({ error: "El cuerpo de la solicitud debe ser JSON válido." });
  }
  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return response.status(400).json({ error: "El cliente seleccionado no existe." });
  }
  console.error("API request failed:", error);
  return response.status(500).json({ error: "Ocurrió un error interno. Intenta nuevamente." });
});

export default app;
