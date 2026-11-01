import { requireAuthenticatedUser } from "@/server/require-authenticated-user";
import ProfilePage from "../../pages/profile-page";

export const instant = false;

export default async function Page() {
  await requireAuthenticatedUser();

  return <ProfilePage />;
}
