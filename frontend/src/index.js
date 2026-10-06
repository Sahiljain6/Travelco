import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import axios from "axios";
import { AuthContextProvider } from "./context/authContext";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

axios.interceptors.request.use((config) => {
  if (config.url && !config.url.startsWith("http://") && !config.url.startsWith("https://")) {
    let cleanUrl = config.url.startsWith("/") ? config.url.slice(1) : config.url;
    if (cleanUrl.startsWith("api/")) {
      cleanUrl = cleanUrl.slice(4);
    }
    const base = API_BASE.endsWith("/") ? API_BASE : `${API_BASE}/`;
    config.url = `${base}${cleanUrl}`;
  }
  return config;
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
