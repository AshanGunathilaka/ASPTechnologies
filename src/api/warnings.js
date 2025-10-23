import axios from "axios";

const withAuth = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

export const adminListWarnings = (token, params = {}) =>
  withAuth(token).get("/warnings", { params });
export const adminCreateWarning = (token, data) =>
  withAuth(token).post("/warnings", data);
export const adminGetWarning = (token, id) =>
  withAuth(token).get(`/warnings/${id}`);
export const adminUpdateWarning = (token, id, data) =>
  withAuth(token).put(`/warnings/${id}`, data);
export const adminDeleteWarning = (token, id) =>
  withAuth(token).delete(`/warnings/${id}`);
