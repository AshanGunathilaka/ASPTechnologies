import axios from "axios";

const withAuth = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchStockSummary = (token, params = {}) => withAuth(token).get(`/stocks/summary`, { params });
export const fetchDailyStock = (token, date) => withAuth(token).get(`/stocks/daily`, { params: { date } });
export const fetchMonthlyStock = (token, year, month) => withAuth(token).get(`/stocks/monthly`, { params: { year, month } });
