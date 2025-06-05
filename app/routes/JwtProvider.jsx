import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchShopToken } from "./auth";

const JwtContext = createContext({ token: null, refresh: () => {} });

export function JwtProvider({ children }) {
  const [token, setToken] = useState(null);
  const [shopDomain, setShopDomain] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShopDomain(window.Shopify?.shop || "robota.store");
    }
  }, []);

  useEffect(() => {
    if (!shopDomain) return;
    fetchShopToken(shopDomain).then(setToken);
  }, [shopDomain]);

  const refresh = () => {
    if (!shopDomain) return;
    fetchShopToken(shopDomain).then(setToken);
  };

  return (
    <JwtContext.Provider value={{ token, refresh }}>
      {children}
    </JwtContext.Provider>
  );
}

export function useJwt() {
  return useContext(JwtContext);
}
