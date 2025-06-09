import { useEffect, useState } from "react";
import { fetchShopToken } from "./auth";

export function useShopToken(shopDomain) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (!shopDomain) return;
    fetchShopToken(shopDomain).then(setToken);
  }, [shopDomain]);

  return token;
}
