const BASE_URL = "https://desarrollosfutura.com:5001";

export async function fetchShopToken(shopDomain) {
  const res = await fetch(`${BASE_URL}/chat/obtener_token_global?shop=${shopDomain}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.token || null;
}
