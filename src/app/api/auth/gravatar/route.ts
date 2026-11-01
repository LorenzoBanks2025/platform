import { AuthenticationService } from "@/server/authentication";
import { readAuthenticationCookie } from "@/server/authenticationCookies";
import { getDatabaseConnection } from "@/server/database";
import { getGravatarUrl } from "@/server/gravatar";
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

  const gravatarUrl = getGravatarUrl(user.email);

  try {
    const response = await fetch(gravatarUrl, {
      method: "HEAD",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (response.status === 404) {
      return authenticationJson({ available: false, gravatarUrl: null });
    }

    if (
      !response.ok ||
      !response.headers.get("content-type")?.startsWith("image/")
    ) {
      throw new Error(
        `Gravatar availability check returned an unexpected response (${response.status}).`,
      );
    }

    return authenticationJson({ available: true, gravatarUrl });
  } catch (error) {
    console.error("Could not check Gravatar availability.", error);
    return authenticationJson(
      { error: "Could not check Gravatar availability. Try again later." },
      { status: 502 },
    );
  }
}
