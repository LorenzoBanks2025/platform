import { AuthenticationError } from "@/server/authentication";

export async function handleAuthenticationRequest(
  handler: () => Promise<Response>,
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return Response.json(
        { error: error.message },
        { status: error.status, headers: { "Cache-Control": "no-store" } },
      );
    }
    throw error;
  }
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new AuthenticationError("Request body must be valid JSON.", 400);
    }
    throw error;
  }
}

export function authenticationJson(
  data: unknown,
  init?: ResponseInit,
): Response {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return Response.json(data, { ...init, headers });
}
