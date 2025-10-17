import { api } from "./api";

// GET /api/users?role=doctor
export async function listDoctors() {
  const { data } = await api.get("/users", { params: { role: "doctor" } });
  return data; // [{ _id, username, role, specialty }]
}
