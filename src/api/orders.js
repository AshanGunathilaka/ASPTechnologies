import axios from "axios";

const withAuth = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

export const adminListOrders = (token, params = {}) =>
  withAuth(token).get("/orders", { params });
export const adminCreateOrder = (token, data) =>
  withAuth(token).post("/orders", data);
export const adminGetOrder = (token, id) =>
  withAuth(token).get(`/orders/${id}`);
export const adminUpdateOrder = (token, id, data) =>
  withAuth(token).put(`/orders/${id}`, data);
export const adminDeleteOrder = (token, id) =>
  withAuth(token).delete(`/orders/${id}`);
