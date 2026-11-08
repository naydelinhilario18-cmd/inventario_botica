import mysql from "mysql2/promise";

export const database = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "nova_user",
  password: process.env.DB_PASSWORD ?? "nova_dev_password",
  database: process.env.DB_NAME ?? "nova_salud",
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
});

export async function ensureSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      category VARCHAR(100) NOT NULL DEFAULT 'General',
      sku VARCHAR(64) NOT NULL UNIQUE,
      price DECIMAL(10,2) NOT NULL,
      stock INT UNSIGNED NOT NULL DEFAULT 0,
      min_stock INT UNSIGNED NOT NULL DEFAULT 5,
      expiration_date DATE NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_products_name (name),
      INDEX idx_products_stock (stock, min_stock)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      document VARCHAR(32) NULL UNIQUE,
      phone VARCHAR(32) NULL,
      email VARCHAR(190) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS sales (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      client_id INT NULL,
      total DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_sales_user FOREIGN KEY (user_id) REFERENCES users(id),
      CONSTRAINT fk_sales_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
      INDEX idx_sales_created (created_at)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS sale_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sale_id INT NOT NULL,
      product_id INT NOT NULL,
      product_name VARCHAR(160) NOT NULL,
      quantity INT UNSIGNED NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      CONSTRAINT fk_items_sale FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
      CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id),
      INDEX idx_items_sale (sale_id)
    ) ENGINE=InnoDB`,
  ];

  for (const statement of statements) {
    await database.query(statement);
  }
}
