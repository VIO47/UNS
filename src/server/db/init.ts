import { runMigrations } from './migrations.js';

(async () => {
  await runMigrations();
  console.log('✓ Database initialized');
  process.exit(0);
})().catch((error) => {
  console.error('Initialization failed:', error.message);
  process.exit(1);
});