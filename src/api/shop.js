import axios from "axios";

export const shopClient = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

export const shopLogin = (credentials) =>
  shopClient().post("/shop/login", credentials);
export const fetchShopMe = (token) => shopClient(token).get("/shop/me");
export const updateShopProfile = (token, data) =>
  shopClient(token).put("/shop/profile", data);
export const shopForgotVerify = (data) =>
  shopClient().post("/shop/forgot-verify", data);
export const shopResetPassword = (data) =>
  shopClient().post("/shop/reset-password", data);
export const fetchShopItems = (token, params = {}) =>
  shopClient(token).get("/shop/items", { params });
export const fetchShopOffers = (token, params = {}) =>
  shopClient(token).get("/shop/offers", { params });
export const fetchShopOffer = (token, id) =>
  shopClient(token).get(`/shop/offers/${id}`);

export const fetchShopDashboard = (token, params = {}) =>
  shopClient(token).get(`/shop/dashboard/overview`, { params });

// Bills (shop)
export const fetchShopBills = (token, params = {}) =>
  shopClient(token).get(`/shop/bills`, { params });
export const fetchShopBill = (token, id) =>
  shopClient(token).get(`/shop/bills/${id}`);
