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
    authentication.logout(await readAuthenticationCookie());
    await clearAuthenticationCookie();
    return authenticationJson({ status: "ok" });
  });
}
