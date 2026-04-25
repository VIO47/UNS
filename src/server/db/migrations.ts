import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './index.ts';

const __dirname: string = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir: string = path.join(__dirname, 'migrations');

// Create migrations table if it doesn't exist
const initMigrationsTable = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

// Get list of applied migrations
const getAppliedMigrations = (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT name FROM migrations ORDER BY name',
      (err: Error | null, rows: Array<{ name: string }>) => {
        if (err) reject(err);
        else resolve(rows.map(r => r.name));
      }
    );
  });
};

// Get list of migration files (only upgrade files)
const getMigrationFiles = (): string[] => {
  const files = fs.readdirSync(migrationsDir);
  return files.filter(f => f.endsWith('_upgrade.sql')).sort();
};

// Extract migration name from filename
const getMigrationName = (filename: string): string => {
  return filename.replace('_upgrade.sql', '');
};

// Run all pending migrations
export const runMigrations = async (): Promise<void> => {
  try {
    await initMigrationsTable();
    
    const appliedMigrations = await getAppliedMigrations();
    const migrationFiles = getMigrationFiles();
    
    console.log('\nRunning migrations...\n');
    
    for (const file of migrationFiles) {
      const migrationName = getMigrationName(file);
      
      if (appliedMigrations.includes(migrationName)) {
        console.log(`✓ ${migrationName} (already applied)`);
        continue;
      }
      
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf-8');
      
      console.log(`→ Applying ${migrationName}...`);
      
      await new Promise<void>((resolve, reject) => {
        db.exec(sql, (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO migrations (name) VALUES (?)',
          [migrationName],
          (err: Error | null) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      console.log(`✓ ${migrationName} applied\n`);
    }
    
    console.log('✓ All migrations completed\n');
  } catch (error) {
    console.error('Migration failed:', (error as Error).message);
    process.exit(1);
  }
};

// Rollback the last migration
export const rollbackMigration = async (): Promise<void> => {
  try {
    await initMigrationsTable();
    
    const appliedMigrations = await getAppliedMigrations();
    if (appliedMigrations.length === 0) {
      console.log('No migrations to rollback');
      return;
    }
    
    const lastMigrationName = appliedMigrations[appliedMigrations.length - 1];
    const downgradeFile = `${lastMigrationName}_downgrade.sql`;
    const downgradePath = path.join(migrationsDir, downgradeFile);
    
    if (!fs.existsSync(downgradePath)) {
      console.error(`No downgrade file found: ${downgradeFile}`);
      process.exit(1);
    }
    
    const downgradeSql = fs.readFileSync(downgradePath, 'utf-8');
    
    console.log(`\nRolling back ${lastMigrationName}...\n`);
    
    await new Promise<void>((resolve, reject) => {
      db.exec(downgradeSql, (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise<void>((resolve, reject) => {
      db.run(
        'DELETE FROM migrations WHERE name = ?',
        [lastMigrationName],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    console.log(`✓ ${lastMigrationName} rolled back\n`);
  } catch (error) {
    console.error('Rollback failed:', (error as Error).message);
    process.exit(1);
  }
};