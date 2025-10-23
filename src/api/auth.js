import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Admin login
export const adminLogin = (credentials) =>
  API.post("/admin/login", credentials);

// Admin register
export const adminRegister = (data) => API.post("/admin/register", data);

// Forgot password verify (name + email)
export const adminForgotVerify = (data) =>
  API.post("/admin/forgot-verify", data);

// Reset password using reset token
export const adminResetPassword = (data) =>
  API.post("/admin/reset-password", data);

// Get current admin profile
export const getAdminProfile = (token) =>
  API.get("/admin/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

// Update current admin profile
export const updateAdminProfile = (token, data) =>
  API.put("/admin/me", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
