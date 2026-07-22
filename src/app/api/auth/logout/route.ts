import { clearSessionCookie } from "@/lib/auth";
import { handleRouteError, jsonOk } from "@/lib/api";

export async function POST() {
  try {
    await clearSessionCookie();
    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
