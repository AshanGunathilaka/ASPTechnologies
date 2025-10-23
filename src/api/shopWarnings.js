import { shopClient } from "./shop";

export const shopListWarnings = (token) =>
  shopClient(token).get("/shop/warnings");
export const shopGetWarning = (token, id) =>
  shopClient(token).get(`/shop/warnings/${id}`);
