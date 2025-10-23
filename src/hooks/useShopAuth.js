import { useContext } from "react";
import { ShopAuthContext } from "../context/ShopAuthContext.jsx";

export const useShopAuth = () => useContext(ShopAuthContext);
