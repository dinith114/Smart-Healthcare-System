import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ---- Demo RBAC headers (so you can flip Patient/Provider easily) ----
// You can override these at runtime via setDemoAuth(...) or by setting
// VITE_DEMO_ROLE / VITE_DEMO_ACTOR_ID / VITE_DEMO_CONSENT in a .env.local
let DEMO = {
  role: import.meta.env.VITE_DEMO_ROLE || "Provider", // "Patient" | "Provider"
  actorId: import.meta.env.VITE_DEMO_ACTOR_ID || "000000000000000000000999", // fake ObjectId
  providerConsent: import.meta.env.VITE_DEMO_CONSENT || "true", // "true" | "false"
};

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Attach demo auth headers to every request (until real auth is wired)
api.interceptors.request.use((config) => {
  // Allow per-request override, otherwise use demo defaults
  const h = config.headers || {};
  if (!h["x-role"]) h["x-role"] = DEMO.role;
  if (!h["x-user-id"]) h["x-user-id"] = DEMO.actorId;
  if (!h["x-provider-consent"]) h["x-provider-consent"] = DEMO.providerConsent;
  config.headers = h;
  return config;
});

// Normalize errors
api.interceptors.response.use(
  (r) => r,
  (err) =>
    Promise.reject(
      new Error(err?.response?.data?.error || err.message || "Network error")
    )
);

// Helper to change demo headers at runtime (useful for toggling Patient/Provider in dev)
export function setDemoAuth({ role, actorId, providerConsent } = {}) {
  DEMO = {
    role: role ?? DEMO.role,
    actorId: actorId ?? DEMO.actorId,
    providerConsent: providerConsent ?? DEMO.providerConsent,
  };
}

// Example:
// setDemoAuth({ role: "Patient", actorId: "<same as patientId>", providerConsent: "false" });
