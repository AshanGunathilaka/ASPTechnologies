import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // ensure this is http://localhost:5000/api
});

// attach token per call
const withAuth = (token) => {
  return axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ----------------- Suppliers -----------------
export const fetchSuppliers = (token) => withAuth(token).get("/suppliers");
export const createSupplier = (token, data) =>
  withAuth(token).post("/suppliers", data);
export const updateSupplier = (token, id, data) =>
  withAuth(token).put(`/suppliers/${id}`, data);
export const deleteSupplier = (token, id) =>
  withAuth(token).delete(`/suppliers/${id}`);
export const fetchSupplier = (token, id) =>
  withAuth(token).get(`/suppliers/${id}`);

// ----------------- Invoices -----------------
export const fetchInvoices = (token, supplierId) =>
  withAuth(token).get(`/suppliers/${supplierId}/invoices`);
export const createInvoice = (token, supplierId, data) =>
  withAuth(token).post(`/suppliers/${supplierId}/invoices`, data);
export const updateInvoice = (token, supplierId, invoiceId, data) =>
  withAuth(token).put(`/suppliers/${supplierId}/invoices/${invoiceId}`, data);
export const deleteInvoice = (token, supplierId, invoiceId) =>
  withAuth(token).delete(`/suppliers/${supplierId}/invoices/${invoiceId}`);
export const fetchInvoice = (token, supplierId, invoiceId) =>
  withAuth(token).get(`/suppliers/${supplierId}/invoices/${invoiceId}`);
