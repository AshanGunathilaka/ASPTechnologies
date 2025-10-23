import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const withAuth = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

// ----------------- Critical Cases -----------------
export const fetchCriticalCases = (token) =>
  withAuth(token).get(`/criticalcases`);
export const createCriticalCase = (token, data) =>
  withAuth(token).post(`/criticalcases`, data);
export const updateCriticalCase = (token, id, data) =>
  withAuth(token).put(`/criticalcases/${id}`, data);
export const deleteCriticalCase = (token, id) =>
  withAuth(token).delete(`/criticalcases/${id}`);
export const fetchCriticalCase = (token, id) =>
  withAuth(token).get(`/criticalcases/${id}`);
