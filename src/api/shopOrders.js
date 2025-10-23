import { shopClient } from "./shop";

export const shopCreateOrder = (token, data) =>
  shopClient(token).post("/shop/orders", data);
export const shopListOrders = (token) => shopClient(token).get("/shop/orders");
export const shopGetOrder = (token, id) =>
  shopClient(token).get(`/shop/orders/${id}`);
export const shopDeleteOrder = (token, id) =>
  shopClient(token).delete(`/shop/orders/${id}`);
