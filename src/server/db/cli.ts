import { runMigrations, rollbackMigration } from './migrations.ts';
import process from 'process';

const command = process.argv[2];

(async () => {
  if (command === 'up') {
    await runMigrations();
  } else if (command === 'down') {
    await rollbackMigration();
  } else {
    console.log('Usage: node src/server/db/cli.ts [up|down]');
    process.exit(1);
  }
})().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});