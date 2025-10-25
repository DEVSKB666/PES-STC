import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// สร้าง pool connection แทน connection เดี่ยว เพื่อเพิ่มประสิทธิภาพ
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'personnel_eval',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

// คืน connection ตรงๆ แต่เพิ่ม end() เป็น alias ให้ release()
export async function openDb() {
  const conn = await pool.getConnection();
  // mysql2 connection already provides execute/query/release
  // provide end() alias for code that calls conn.end()
  conn.end = () => conn.release();
  return conn;
}

// ฟังก์ชันใหม่ที่ใช้งานง่ายกว่า
export async function query(sql, params) {
  return pool.query(sql, params);
}
