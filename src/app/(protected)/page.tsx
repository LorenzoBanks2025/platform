import { requireAuthenticatedUser } from "@/server/require-authenticated-user";
import Dashboard from "../pages/dashboard-page";

export const instant = false;

export default async function Page() {
  const user = await requireAuthenticatedUser();

  return <Dashboard user={user} />;
}
