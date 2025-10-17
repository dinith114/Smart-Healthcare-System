// frontend/src/services/users.js
import { api } from "./api";

// GET /api/users/doctors
export async function listDoctors() {
  const { data } = await api.get("/users/doctors");
  // Normalize shape for the dropdown/UI
  return data.map(d => ({
    _id: d._id,
    username: d.username,
    specialty: d.specialty || "",
    position: d.position || "Doctor",
    email: d.email || "",
  }));
}
