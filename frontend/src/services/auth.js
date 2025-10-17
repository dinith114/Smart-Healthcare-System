import { api } from "./api";

// Real login (use your backend route if available)
export async function login(username, password) {
  const { data } = await api.post("/auth/login", { username, password });
  localStorage.setItem("token", data.token);
  return currentUser();
}

// Helper for demo/dev if you don’t have /auth yet
export function setMockUser() {
  const mock = { userId: "patient-demo-1", username: "demoPatient" };
  localStorage.setItem("token", "");               // no JWT needed for mock
  localStorage.setItem("mockUser", JSON.stringify(mock));
  return mock;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("mockUser");
}

export function currentUser() {
  // Prefer JWT user if you have it; otherwise fall back to mock
  const mock = localStorage.getItem("mockUser");
  return mock ? JSON.parse(mock) : null;
}
