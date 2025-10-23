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

export const fetchPayments = (token, supplierId, invoiceId) =>
  withAuth(token).get(
    `/suppliers/${supplierId}/invoices/${invoiceId}/payments`
  );

export const createPayment = (token, supplierId, invoiceId, data) =>
  withAuth(token).post(
    `/suppliers/${supplierId}/invoices/${invoiceId}/payments`,
    data
  );

export const deletePayment = (token, supplierId, invoiceId, paymentId) =>
  withAuth(token).delete(
    `/suppliers/${supplierId}/invoices/${invoiceId}/payments/${paymentId}`
  );
