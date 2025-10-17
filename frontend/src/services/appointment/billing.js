import { api } from "../api";

export async function getQuote(doctorId) {
  const { data } = await api.get("/billing/quote", { params: { doctorId } });
  return data; // { doctorId, doctorName, specialty, amount, currency }
}
