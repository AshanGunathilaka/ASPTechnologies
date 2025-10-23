import axios from "axios";

const withAuth = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchDashboardOverview = (token, params = {}) =>
  withAuth(token).get(`/dashboard/overview`, { params });
