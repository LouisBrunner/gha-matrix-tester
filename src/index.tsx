import * as React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

declare global {
  interface ProcessWithEnv {
    env: Record<string, string>;
  }

  var process: ProcessWithEnv;
}
const isDev = process.env.ENV === "development";
const isWatching = process.env.WATCH_MODE;

// React
const container = document.getElementById("app");
if (!container) {
  throw new Error("No container found");
}
const root = createRoot(container);
root.render(<App />);

// Development
if (isDev) {
  const errorsContainer = document.getElementById("errors");
  if (!errorsContainer) {
    throw new Error("No errors container found");
  }
  window.addEventListener("error", (error) => {
    console.error("Uncaught error:", error);
    const errorElement = document.createElement("pre");
    errorElement.textContent = error.message;
    errorElement.title = error.error.stack;
    errorsContainer.appendChild(errorElement);
  });
}

// Hot reload
if (isWatching) {
  new EventSource("/esbuild").addEventListener("change", () => {
    location.reload();
  });
}
