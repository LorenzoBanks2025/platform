import { AuthenticationService } from "@/server/authentication";
import {
  clearAuthenticationCookie,
  readAuthenticationCookie,
} from "@/server/authenticationCookies";
import { getDatabaseConnection } from "@/server/database";
import {
  authenticationJson,
  handleAuthenticationRequest,
} from "../route-utils";

export async function POST(): Promise<Response> {
  return handleAuthenticationRequest(async () => {
    const authentication = new AuthenticationService(getDatabaseConnection());
    const token = await readAuthenticationCookie();
    if (!authentication.authenticate(token)) {
      return authenticationJson(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    authentication.logout(token);
    await clearAuthenticationCookie();
    return authenticationJson({ status: "ok" });
  });
}
