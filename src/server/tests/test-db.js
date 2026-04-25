import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'db', 'app.db');

console.log('Connecting to database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
  console.log('Connected successfully!\n');
});

// Test: List all tables
db.all(
  "SELECT name FROM sqlite_master WHERE type='table'",
  (err, tables) => {
    if (err) {
      console.error('Error getting tables:', err.message);
      process.exit(1);
    }
    
    if (!tables || tables.length === 0) {
      console.log('No tables found. Run migrations first:');
      console.log('  npm run db:migrate\n');
    } else {
      console.log('Tables found:');
      tables.forEach(t => console.log(`  - ${t.name}`));
    }
    
    db.close();
    process.exit(0);
  }
);