import axios from "axios";

const withAuth = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchItems = (token, params) =>
  withAuth(token).get("/items", { params });
export const createItem = (token, data) => withAuth(token).post("/items", data);
export const updateItem = (token, id, data) =>
  withAuth(token).put(`/items/${id}`, data);
export const deleteItem = (token, id) => withAuth(token).delete(`/items/${id}`);
