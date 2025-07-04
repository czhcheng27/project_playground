import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { OverlayProvider } from "./components/overlay/OverlayProvider.tsx";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <OverlayProvider>
        <App />
      </OverlayProvider>
    </BrowserRouter>
  </StrictMode>
);
