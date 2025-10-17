import { api } from "./api";

// ---- helpers ----
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function tokenUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  // optional: reject expired tokens
  if (payload.exp && Date.now() >= payload.exp * 1000) return null;

  // your backend sets: { userId, role, username }
  return {
    userId: payload.userId,
    role: payload.role,
    username: payload.username,
  };
}

// ---- API ----
export async function login(username, password) {
  const { data } = await api.post("/auth/login", { username, password });
  localStorage.setItem("token", data.token);
  return currentUser();
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("mockUser");
}

export function setMockUser() {
  // keep for dev if you want; AppointmentForm will prefer real JWT user
  const mock = { userId: "patient-demo-1", username: "demoPatient", role: "patient" };
  localStorage.setItem("mockUser", JSON.stringify(mock));
  return mock;
}

export function currentUser() {
  // 1) try JWT
  const fromToken = tokenUser();
  if (fromToken) return fromToken;

  // 2) fallback to mock (dev only)
  const mock = localStorage.getItem("mockUser");
  return mock ? JSON.parse(mock) : null;
}
