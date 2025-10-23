import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const withAuth = (token) => {
  return axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ----------------- Repairs -----------------
export const fetchRepairs = (token) => withAuth(token).get("/repairs");
export const fetchRepairById = (token, id) =>
  withAuth(token).get(`/repairs/${id}`);
export const createRepair = (token, data) =>
  withAuth(token).post("/repairs", data);
export const updateRepair = (token, id, data) =>
  withAuth(token).put(`/repairs/${id}`, data);
export const deleteRepair = (token, id) =>
  withAuth(token).delete(`/repairs/${id}`);

// search & helpers
export const searchRepairsByImei = (token, imei) =>
  withAuth(token).get(`/repairs/search`, { params: { imei } });
export const getNextJobSheetNumber = (token) =>
  withAuth(token).get(`/repairs/next-number`);
