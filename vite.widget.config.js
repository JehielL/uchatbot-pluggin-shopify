import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { enableChatbotScriptTag } from "../api/scripts";

export const action = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    console.log("[api.scripts.js] SESSION FROM SERVER:", session);

    if (!session || !session.shop || !session.accessToken) {
      console.error("[api.scripts.js] Sesión inválida:", session);
      return json({ error: "No se pudo cargar la sesión" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;
    console.log("[api.scripts.js] Acción recibida:", action);

    if (action === "create") {
      console.log("[api.scripts.js] Activando ScriptTag para", session.shop);
      await enableChatbotScriptTag({ session });
      return json({ ok: true });
    }
    if (action === "delete") {
      // ... implementa disable si quieres
      return json({ ok: true });
    }
    return json({ error: "Acción desconocida" }, { status: 400 });
  } catch (e) {
    console.error("[api.scripts.js] ERROR /api/scripts:", e, e?.response?.data || "");
    return json({ error: e.message }, { status: 500 });
  }
};
