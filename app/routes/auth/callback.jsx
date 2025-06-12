// routes/auth/callback.jsx
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }) => {
  // Shopify manejará el callback, intercambiará el code por access_token y guardará la sesión.
  return authenticate.loader({ request });
};
