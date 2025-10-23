import axios from "axios";

const withAuth = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchNotes = (token, params = {}) =>
  withAuth(token).get(`/notes`, { params });
export const createNote = (token, data) => withAuth(token).post(`/notes`, data);
export const getNote = (token, id) => withAuth(token).get(`/notes/${id}`);
export const updateNote = (token, id, data) =>
  withAuth(token).put(`/notes/${id}`, data);
export const deleteNote = (token, id) => withAuth(token).delete(`/notes/${id}`);
