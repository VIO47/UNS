import { t } from './init.ts';
import { designOptionsProcedures } from './procedures/design-options';

export const appRouter = t.router({
  ...designOptionsProcedures,
});

export type AppRouter = typeof appRouter;