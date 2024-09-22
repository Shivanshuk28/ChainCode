import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ProblemProvider } from "./context/ProblemContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProblemProvider>
      <App />
    </ProblemProvider>
  </StrictMode>
);
