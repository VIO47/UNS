import { setupTRPCServer } from './trpc/server';

const TRPC_PORT = 3001;

setupTRPCServer(TRPC_PORT);
console.log(`Server listening on http://localhost:${TRPC_PORT}/trpc`);