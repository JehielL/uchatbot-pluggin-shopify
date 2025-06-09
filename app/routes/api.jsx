// src/api/api.js
const BASE_URL = "https://desarrollosfutura.com:5001";

export const getConfig = async (token) => {
  const res = await fetch(`${BASE_URL}/chat/config`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  return res.json();
};

export const saveConfig = async (config, token) => {
  const res = await fetch(`${BASE_URL}/chat/config`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(config)
  });
  return res.json();
};

export async function fetchShopToken(shopDomain) {
  const res = await fetch(`${BASE_URL}/chat/obtener_token_global?shop=${shopDomain}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.token || null;
}

