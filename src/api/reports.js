import axios from "axios";

const withAuth = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchSummaryReport = (token, params = {}) =>
  withAuth(token).get(`/reports/summary`, { params });
export const fetchCashflowReport = (token, params = {}) =>
  withAuth(token).get(`/reports/cashflow`, { params });
export const fetchTopItemsReport = (token, params = {}) =>
  withAuth(token).get(`/reports/top-items`, { params });
export const fetchProfitReport = (token, params = {}) =>
  withAuth(token).get(`/reports/profit`, { params });
export const fetchProfitItemsReport = (token, params = {}) =>
  withAuth(token).get(`/reports/profit-items`, { params });
