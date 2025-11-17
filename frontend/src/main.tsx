import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SnackbarProvider } from "notistack";
import { SyncOverlayProvider } from "./contexts/SyncOverlayContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
      <SyncOverlayProvider>
        <App />
      </SyncOverlayProvider>
    </SnackbarProvider>
  </React.StrictMode>
);
