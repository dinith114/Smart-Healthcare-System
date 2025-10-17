// // src/utils/auth.js
// import { auth } from "../services/api";

// export function getUser() {
//   const { user } = auth.load() || {};
//   return user || null;
// }

// export function isLoggedIn() {
//   const { token } = auth.load() || {};
//   return Boolean(token);
// }

// export function logout() {
//   auth.clear();
//   // ensure back button can't return to protected pages
//   window.location.replace("/login");
// }
