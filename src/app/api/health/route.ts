import { connection } from "next/server";
import { getDatabaseConnection } from "@/server/database";

export async function GET() {
  await connection();
  getDatabaseConnection().db.$client.prepare("SELECT 1").get();

  return Response.json({ status: "ok" });
}
