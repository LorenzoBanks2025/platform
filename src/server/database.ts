import "server-only";
import { createDatabase, type DatabaseConnection } from "@nfa/database";

type PlatformGlobal = typeof globalThis & {
  platformDatabase?: DatabaseConnection;
};

const platformGlobal = globalThis as PlatformGlobal;

export function getDatabaseConnection(): DatabaseConnection {
  if (!platformGlobal.platformDatabase) {
    const filename = process.env.NFA_DATABASE_PATH ?? ".data/platform.sqlite";
    platformGlobal.platformDatabase = createDatabase(filename);
  }

  return platformGlobal.platformDatabase;
}
