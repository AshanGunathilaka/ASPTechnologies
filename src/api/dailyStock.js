import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const withAuth = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

// ----------------- Daily Stocks -----------------
export const fetchDailyStocks = (token) => withAuth(token).get(`/dailystocks`);

export const createDailyStock = (token, data) =>
  withAuth(token).post(`/dailystocks`, data);

export const updateDailyStock = (token, id, data) =>
  withAuth(token).put(`/dailystocks/${id}`, data);

export const deleteDailyStock = (token, id) =>
  withAuth(token).delete(`/dailystocks/${id}`);
