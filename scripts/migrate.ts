import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT) || 4000,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || 'test',
    ssl: { rejectUnauthorized: true },
  });

  console.log('Connected to TiDB Cloud');

  // Create tables
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      nama VARCHAR(255) NOT NULL,
      nik VARCHAR(20) NOT NULL,
      alamat TEXT,
      no_hp VARCHAR(20),
      tanggal_lahir DATE,
      username VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE INDEX idx_username (username),
      UNIQUE INDEX idx_nik (nik)
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS queues (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      nama VARCHAR(255) NOT NULL,
      nomor VARCHAR(10) NOT NULL,
      status ENUM('menunggu','dipanggil','sedang_berobat','selesai','hangus') DEFAULT 'menunggu',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      called_at TIMESTAMP NULL,
      queue_date DATE NOT NULL,
      INDEX idx_queue_date (queue_date),
      INDEX idx_user_queue (user_id, queue_date)
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS admin (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      UNIQUE INDEX idx_admin_username (username)
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS queue_metadata (
      id VARCHAR(36) PRIMARY KEY,
      queue_date DATE NOT NULL,
      counter INT DEFAULT 0,
      UNIQUE INDEX idx_meta_date (queue_date)
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS queue_archives (
      id INT AUTO_INCREMENT PRIMARY KEY,
      queue_date DATE NOT NULL,
      data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE INDEX idx_archive_date (queue_date)
    )
  `);

  // Seed admin
  const hashed = await bcrypt.hash('admin123', 10);
  await connection.execute(
    'INSERT IGNORE INTO admin (username, password) VALUES (?, ?)',
    ['admin', hashed]
  );

  console.log('Tables created & admin seeded');
  
  // Verify
  const [users] = await connection.execute('SELECT COUNT(*) as count FROM admin');
  console.log('Admin count:', (users as any[])[0].count);

  await connection.end();
  console.log('Migration complete ✅');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});