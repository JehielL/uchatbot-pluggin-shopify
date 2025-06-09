import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { enableChatbotScriptTag } from "../api/scripts";

export const action = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    if (!session) {
      return json({ error: "No se pudo cargar la sesión" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      // LOG: Verifica que la sesión es válida y tiene token
      console.log("Activando ScriptTag para", session.shop, session.accessToken);
      await enableChatbotScriptTag({ session });
      return json({ ok: true });
    }
    if (action === "delete") {
      // ... implementa disable si quieres
      return json({ ok: true });
    }
    return json({ error: "Acción desconocida" }, { status: 400 });
  } catch (e) {
    console.error("ERROR /api/scripts:", e); // Esto te dará el error exacto en consola de servidor
    return json({ error: e.message }, { status: 500 });
  }
};
