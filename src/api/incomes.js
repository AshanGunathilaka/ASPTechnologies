import axios from "axios";

const withAuth = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchIncomeDays = (token) => withAuth(token).get(`/incomes`);
export const addIncomeEntry = (token, data) =>
  withAuth(token).post(`/incomes`, data);
export const getIncomeDay = (token, id) =>
  withAuth(token).get(`/incomes/${id}`);
export const updateIncomeDay = (token, id, data) =>
  withAuth(token).put(`/incomes/${id}`, data);
export const deleteIncomeDay = (token, id) =>
  withAuth(token).delete(`/incomes/${id}`);
export const deleteIncomeEntry = (token, id, entryId) =>
  withAuth(token).delete(`/incomes/${id}/entries/${entryId}`);
