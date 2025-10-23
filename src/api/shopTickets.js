import { shopClient } from "./shop";

export const shopCreateTicket = (token, data) =>
  shopClient(token).post("/shop/tickets", data);
export const shopListTickets = (token) =>
  shopClient(token).get("/shop/tickets");
export const shopGetTicket = (token, id) =>
  shopClient(token).get(`/shop/tickets/${id}`);
export const shopDeleteTicket = (token, id) =>
  shopClient(token).delete(`/shop/tickets/${id}`);
