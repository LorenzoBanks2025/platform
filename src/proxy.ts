import { type NextRequest, NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE } from "./authentication-constants";

const publicPagePaths = new Set(["/login", "/register"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (publicPagePaths.has(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(AUTH_SESSION_COOKIE);
  if (!sessionCookie?.value) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
