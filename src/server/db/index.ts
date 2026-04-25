import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname: string = path.dirname(fileURLToPath(import.meta.url));
const dbPath: string = path.join(__dirname, 'app.db');

const db: sqlite3.Database = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.run('PRAGMA foreign_keys = ON');

export default db;