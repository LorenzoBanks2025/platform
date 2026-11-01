import {
  AuthenticationError,
  AuthenticationService,
} from "@/server/authentication";
import { readAuthenticationCookie } from "@/server/authenticationCookies";
import { getDatabaseConnection } from "@/server/database";
import {
  authenticationJson,
  handleAuthenticationRequest,
  readJsonBody,
} from "../route-utils";

export async function PATCH(request: Request): Promise<Response> {
  return handleAuthenticationRequest(async () => {
    const authentication = new AuthenticationService(getDatabaseConnection());
    const user = authentication.authenticate(await readAuthenticationCookie());

    if (!user) {
      return authenticationJson(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const body = await readJsonBody(request);
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return authenticationJson(
        { error: "A JSON object is required." },
        { status: 400 },
      );
    }

    if (!Object.hasOwn(body, "avatarUrl")) {
      throw new AuthenticationError(
        "Avatar URL is required. Send null to remove it.",
        400,
      );
    }

    const profile = body as Record<string, unknown>;
    const updatedUser = authentication.updateAvatar(user.id, profile.avatarUrl);

    return authenticationJson({ user: updatedUser });
  });
}
