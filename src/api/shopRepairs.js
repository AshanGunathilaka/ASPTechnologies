import { shopClient } from "./shop";

export const shopCreateRepair = (token, data) =>
  shopClient(token).post("/shop/repairs", data);
export const shopListRepairs = (token) =>
  shopClient(token).get("/shop/repairs");
export const shopGetRepair = (token, id) =>
  shopClient(token).get(`/shop/repairs/${id}`);

export const shopSearchRepairsByImei = (token, imei) =>
  shopClient(token).get(`/shop/repairs/search`, { params: { imei } });
export const shopGetNextJobSheetNumber = (token) =>
  shopClient(token).get(`/shop/repairs/next-number`);
