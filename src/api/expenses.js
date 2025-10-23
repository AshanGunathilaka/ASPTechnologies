import axios from "axios";

const withAuth = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchExpenseDays = (token) => withAuth(token).get(`/expenses`);
export const addExpenseEntry = (token, data) => withAuth(token).post(`/expenses`, data);
export const getExpenseDay = (token, id) => withAuth(token).get(`/expenses/${id}`);
export const updateExpenseDay = (token, id, data) => withAuth(token).put(`/expenses/${id}`, data);
export const deleteExpenseDay = (token, id) => withAuth(token).delete(`/expenses/${id}`);
export const deleteExpenseEntry = (token, id, entryId) =>
  withAuth(token).delete(`/expenses/${id}/entries/${entryId}`);
