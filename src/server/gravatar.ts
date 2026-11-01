import "server-only";
import { createHash } from "node:crypto";

export function getGravatarUrl(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  const hash = createHash("md5").update(normalizedEmail).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?d=404`;
}
