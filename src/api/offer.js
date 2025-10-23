import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const withAuth = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

// ✅ Fetch all offers for logged-in admin
export const fetchOffers = (token) => withAuth(token).get(`/offers`);

// ✅ Create new offer (multipart/form-data for image + items)
export const createOffer = (token, data) =>
  withAuth(token).post(`/offers`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ✅ Update existing offer
export const updateOffer = (token, id, data) =>
  withAuth(token).put(`/offers/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ✅ Delete an offer
export const deleteOffer = (token, id) =>
  withAuth(token).delete(`/offers/${id}`);

// ✅ Fetch single offer by ID
export const fetchOffer = (token, id) => withAuth(token).get(`/offers/${id}`);
