import axios from "axios";

<<<<<<< Updated upstream
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

=======
>>>>>>> Stashed changes
export const api = axios.create({
  baseURL: "http://localhost:5000/api", // your backend
});

<<<<<<< Updated upstream
// Attach JWT token from localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401/403 if it's NOT a login attempt
    // (login failures should be handled by the login page)
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');
    
    if (error.response?.status === 401 && !isLoginEndpoint) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    // Note: 403 from login (deactivated account) should also be handled by login page
    return Promise.reject(error);
  }
);

// ---- Demo RBAC headers for medical records module (backward compatibility) ----
let DEMO = {
  role: import.meta.env.VITE_DEMO_ROLE || "Provider",
  actorId: import.meta.env.VITE_DEMO_ACTOR_ID || "000000000000000000000999",
  providerConsent: import.meta.env.VITE_DEMO_CONSENT || "true",
};

export function setDemoAuth({ role, actorId, providerConsent } = {}) {
  DEMO = {
    role: role ?? DEMO.role,
    actorId: actorId ?? DEMO.actorId,
    providerConsent: providerConsent ?? DEMO.providerConsent,
  };
}

// For medical records module endpoints that still use demo headers
export function getDemoHeaders() {
  return {
    "x-role": DEMO.role,
    "x-user-id": DEMO.actorId,
    "x-provider-consent": DEMO.providerConsent,
  };
}
=======
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
>>>>>>> Stashed changes
