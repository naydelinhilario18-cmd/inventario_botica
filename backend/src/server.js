import bcrypt from "bcryptjs";
import app from "./app.js";
import { database, ensureSchema } from "./config/database.js";

const port = Number(process.env.PORT ?? 3000);

async function start() {
  await ensureSchema();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "NovaSalud123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await database.execute(
    `INSERT IGNORE INTO users (name, email, password_hash, role)
     VALUES ('Administrador', 'admin@novasalud.local', ?, 'admin')`,
    [passwordHash],
  );
  app.listen(port, "0.0.0.0", () => {
    console.log(`Nova Salud API escuchando en el puerto ${port}`);
  });
}

start().catch((error) => {
  console.error("No se pudo iniciar Nova Salud API:", error);
  process.exitCode = 1;
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await database.end();
    process.exit(0);
  });
}
