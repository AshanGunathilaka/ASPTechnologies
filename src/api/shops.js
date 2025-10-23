import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const withAuth = (token) => {
  return axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ----------------- Shops -----------------
export const fetchShops = (token) => withAuth(token).get("/shops");
export const createShop = (token, data) => withAuth(token).post("/shops", data);
export const updateShop = (token, id, data) =>
  withAuth(token).put(`/shops/${id}`, data);
export const deleteShop = (token, id) => withAuth(token).delete(`/shops/${id}`);
export const fetchShop = (token, id) => withAuth(token).get(`/shops/${id}`);

// ----------------- Bills -----------------
export const fetchBills = (token, shopId) =>
  withAuth(token).get(`/shops/${shopId}/bills`);
export const createBill = (token, shopId, data) =>
  withAuth(token).post(`/shops/${shopId}/bills`, data);
export const updateBill = (token, shopId, billId, data) =>
  withAuth(token).put(`/shops/${shopId}/bills/${billId}`, data);
export const deleteBill = (token, shopId, billId) =>
  withAuth(token).delete(`/shops/${shopId}/bills/${billId}`);
export const fetchBill = (token, shopId, billId) =>
  withAuth(token).get(`/shops/${shopId}/bills/${billId}`);

// ----------------- Bill Payments -----------------
export const fetchBillPayments = (token, shopId, billId) =>
  withAuth(token).get(`/shops/${shopId}/bills/${billId}/payments`);
export const createBillPayment = (token, shopId, billId, data) =>
  withAuth(token).post(`/shops/${shopId}/bills/${billId}/payments`, data);
export const deleteBillPayment = (token, shopId, billId, paymentId) =>
  withAuth(token).delete(
    `/shops/${shopId}/bills/${billId}/payments/${paymentId}`
  );
