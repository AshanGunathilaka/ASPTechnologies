import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const withAuth = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchItems = (token, params) =>
  withAuth(token).get(`/items`, { params });

export const createItem = (token, data) =>
  withAuth(token).post(`/items`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateItem = (token, id, data) =>
  withAuth(token).put(`/items/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteItem = (token, id) => withAuth(token).delete(`/items/${id}`);

export const getItem = (token, id) => withAuth(token).get(`/items/${id}`);
