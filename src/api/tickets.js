import axios from "axios";

const withAuth = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

export const adminListTickets = (token, params = {}) =>
  withAuth(token).get("/tickets", { params });
export const adminCreateTicket = (token, data) =>
  withAuth(token).post("/tickets", data);
export const adminGetTicket = (token, id) =>
  withAuth(token).get(`/tickets/${id}`);
export const adminUpdateTicket = (token, id, data) =>
  withAuth(token).put(`/tickets/${id}`, data);
export const adminDeleteTicket = (token, id) =>
  withAuth(token).delete(`/tickets/${id}`);
