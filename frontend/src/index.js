import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import axios from "axios";
import { AuthContextProvider } from "./context/authContext";

let rawBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
if (!rawBase.startsWith("http://") && !rawBase.startsWith("https://")) {
  rawBase = `https://${rawBase}`;
}
rawBase = rawBase.replace(/\/+$/, "");
if (!rawBase.endsWith("/api")) rawBase = `${rawBase}/api`;
const API_BASE = rawBase;

// Auth uses an HTTP-only cookie; include it on cross-origin API calls.
axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
  if (config.url && !config.url.startsWith("http://") && !config.url.startsWith("https://")) {
    let cleanUrl = config.url.startsWith("/") ? config.url.slice(1) : config.url;
    if (cleanUrl.startsWith("api/")) cleanUrl = cleanUrl.slice(4);
    config.url = `${API_BASE}/${cleanUrl}`;
  }

  // Cookies remain the primary session mechanism. Send the short-lived tab session token as a fallback
  // only to Travelco's configured API, for browsers that block cross-site cookies.
  const sessionToken = sessionStorage.getItem("travelcoAccessToken");
  if (sessionToken && config.url && config.url.startsWith(API_BASE)) {
    config.headers = config.headers || {};
    if (typeof config.headers.set === "function") {
      config.headers.set("Authorization", `Bearer ${sessionToken}`);
    } else {
      config.headers.Authorization = `Bearer ${sessionToken}`;
    }
  }
  return config;
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthContextProvider>
    <App />
  </AuthContextProvider>
);
