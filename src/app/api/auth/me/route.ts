import { AuthenticationService } from "@/server/authentication";
import { readAuthenticationCookie } from "@/server/authenticationCookies";
import { getDatabaseConnection } from "@/server/database";
import { authenticationJson } from "../route-utils";

export async function GET(): Promise<Response> {
  const authentication = new AuthenticationService(getDatabaseConnection());
  const user = authentication.authenticate(await readAuthenticationCookie());

  if (!user) {
    return authenticationJson(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  return authenticationJson({ user });
}
