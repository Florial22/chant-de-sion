import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";       
import { registerSW } from "virtual:pwa-register";

// --- iOS status bar setup (safe area) ---
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

if (Capacitor.getPlatform() === "ios") {

  StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});

  StatusBar.setBackgroundColor({ color: "#417956" }).catch(() => {});
  StatusBar.setStyle({ style: Style.Light }).catch(() => {});
}

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
