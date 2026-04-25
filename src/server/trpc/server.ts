import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { appRouter } from './index.js';
import cors from 'cors';
import http from 'http';

const corsMiddleware = cors();

export function setupTRPCServer(port: number): void {
  const trpcHandler = createHTTPHandler({
    middleware: corsMiddleware,
    router: appRouter,
    createContext: () => ({}),
  });

  const server = http.createServer((req, res) => {
    corsMiddleware(req, res, () => {
      // Dummy endpoint for testing URL import
      if (req.url === '/dummy-options' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([
          { name: "Timber Frame A", floor_area: 120, budget: 85000, carbon_kg: 12400, daylight: 7.2, notes: "Lightweight timber structure." },
          { name: "Concrete Core B", floor_area: 200, budget: 142000, carbon_kg: 38000, daylight: 5.1, notes: "Reinforced concrete core." },
          { name: "Hybrid Steel C", floor_area: 175, budget: 118000, carbon_kg: 27500, daylight: 6.8, notes: "Steel frame with timber infill." },
          { name: "Passive House D", floor_area: 95,  budget: 72000,  carbon_kg: 9800,  daylight: 8.5, notes: "Ultra-low energy standard." },
          { name: "Modular E",       floor_area: 150, budget: 96000,  carbon_kg: 15200, daylight: 7.9, notes: "Prefabricated modular units." },
        ]));
        return;
      }

      // All other requests go to tRPC
      trpcHandler(req, res);
    });
  });

  server.listen(port);
  console.log(`TRPC server running on http://localhost:${port}`);
}