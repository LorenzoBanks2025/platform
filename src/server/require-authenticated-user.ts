import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AuthenticationService } from "./authentication";
import { readAuthenticationCookie } from "./authenticationCookies";
import { getDatabaseConnection } from "./database";

export async function requireAuthenticatedUser() {
  await connection();

  const authentication = new AuthenticationService(getDatabaseConnection());
  const user = authentication.authenticate(await readAuthenticationCookie());

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdministrator() {
  const user = await requireAuthenticatedUser();

  if (user.role !== "admin") {
    redirect("/");
  }

  return user;
}
