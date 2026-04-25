import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { trpc, queryClient, trpcClient } from "./trpc.ts";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";

const domNode = document.getElementById("root");
const root = createRoot(domNode!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </trpc.Provider>
    </BrowserRouter>
  </React.StrictMode>,
);
