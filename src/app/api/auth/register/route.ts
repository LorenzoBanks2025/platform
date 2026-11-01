import { AuthenticationService } from "@/server/authentication";
import { setAuthenticationCookie } from "@/server/authenticationCookies";
import { getDatabaseConnection } from "@/server/database";
import {
  authenticationJson,
  handleAuthenticationRequest,
  readJsonBody,
} from "../route-utils";

export async function POST(request: Request): Promise<Response> {
  return handleAuthenticationRequest(async () => {
    const session = await new AuthenticationService(
      getDatabaseConnection(),
    ).register(await readJsonBody(request));
    await setAuthenticationCookie(session);
    return authenticationJson({ user: session.user }, { status: 201 });
  });
}
