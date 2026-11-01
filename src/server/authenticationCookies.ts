import "server-only";
import { cookies } from "next/headers";
import { AUTH_SESSION_COOKIE } from "../authentication-constants";
import type { AuthenticationSession } from "./authentication";

export { AUTH_SESSION_COOKIE };

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthenticationCookie(
  session: AuthenticationSession,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE, session.token, {
    ...cookieOptions,
    expires: session.expiresAt,
  });
}

export async function readAuthenticationCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_SESSION_COOKIE)?.value;
}

export async function clearAuthenticationCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE, "", {
    ...cookieOptions,
    expires: new Date(0),
    maxAge: 0,
  });
}
