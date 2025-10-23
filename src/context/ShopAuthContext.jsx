import React, { createContext, useEffect, useState } from "react";
import { fetchShopMe, shopLogin as apiLogin } from "../api/shop";

const ShopAuthContext = createContext();

export const ShopAuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem("shopAuth");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth?.token) {
      fetchShopMe(auth.token)
        .then((res) => {
          setAuth((prev) => ({ ...prev, shop: res.data }));
        })
        .catch(() => {
          setAuth(null);
        });
    }
  }, [auth?.token]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await apiLogin({ username, password });
      const data = { token: res.data.token, shop: res.data.shop };
      setAuth(data);
      localStorage.setItem("shopAuth", JSON.stringify(data));
      return true;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem("shopAuth");
  };

  // Allow updating shop details in context after profile update
  const updateShop = (partialShop) => {
    setAuth((prev) => {
      if (!prev) return prev;
      const next = { ...prev, shop: { ...prev.shop, ...partialShop } };
      localStorage.setItem("shopAuth", JSON.stringify(next));
      return next;
    });
  };

  return (
    <ShopAuthContext.Provider
      value={{ auth, loading, login, logout, updateShop }}
    >
      {children}
    </ShopAuthContext.Provider>
  );
};

export { ShopAuthContext };
