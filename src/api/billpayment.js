import axios from "axios";

const withAuth = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

// ----------------- Bill Payments -----------------
// /api/shops/:shopId/bills/:billId/payments
export const fetchBillPayments = (token, shopId, billId) =>
  withAuth(token).get(`/shops/${shopId}/bills/${billId}/payments`);

export const createBillPayment = (token, shopId, billId, data) =>
  withAuth(token).post(`/shops/${shopId}/bills/${billId}/payments`, data);

export const deleteBillPayment = (token, shopId, billId, paymentId) =>
  withAuth(token).delete(
    `/shops/${shopId}/bills/${billId}/payments/${paymentId}`
  );

export const fetchBillPayment = (token, shopId, billId, paymentId) =>
  withAuth(token).get(`/shops/${shopId}/bills/${billId}/payments/${paymentId}`);
