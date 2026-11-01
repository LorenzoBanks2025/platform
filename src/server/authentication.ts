import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { DatabaseConnection, User } from "@nfa/database";
import { AuthenticationModel, UserModel } from "@nfa/database";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const PASSWORD_HASH_LENGTH = 64;
const SCRYPT_COST = 32_768;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export class AuthenticationError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export type AuthenticationSession = {
  token: string;
  expiresAt: Date;
  user: User;
};

function derivePassword(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      PASSWORD_HASH_LENGTH,
      { N: SCRYPT_COST, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await derivePassword(password, salt);
  return `scrypt$${SCRYPT_COST}$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`;
}

async function verifyPassword(
  password: string,
  encodedHash: string,
): Promise<boolean> {
  const [algorithm, cost, saltValue, keyValue, extra] = encodedHash.split("$");
  if (
    algorithm !== "scrypt" ||
    cost !== String(SCRYPT_COST) ||
    !saltValue ||
    !keyValue ||
    extra !== undefined ||
    !/^[A-Za-z0-9_-]+$/.test(saltValue) ||
    !/^[A-Za-z0-9_-]+$/.test(keyValue)
  ) {
    return false;
  }

  const salt = Buffer.from(saltValue, "base64url");
  const expectedKey = Buffer.from(keyValue, "base64url");
  if (salt.length !== 16 || expectedKey.length !== PASSWORD_HASH_LENGTH) {
    return false;
  }

  const actualKey = await derivePassword(password, salt);
  return timingSafeEqual(actualKey, expectedKey);
}

function normalizeEmail(email: unknown): string {
  if (typeof email !== "string") {
    throw new AuthenticationError("A valid email address is required.", 400);
  }

  const normalized = email.trim().toLowerCase();
  if (
    normalized.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
  ) {
    throw new AuthenticationError("A valid email address is required.", 400);
  }

  return normalized;
}

function validatePassword(password: unknown): asserts password is string {
  if (
    typeof password !== "string" ||
    password.length < 12 ||
    Buffer.byteLength(password, "utf8") > 1024
  ) {
    throw new AuthenticationError(
      "Password must be at least 12 characters and no more than 1024 bytes.",
      400,
    );
  }
}

function validateName(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new AuthenticationError(`${label} is required.`, 400);
  }

  const name = value.trim();
  if (name.length === 0 || name.length > 100) {
    throw new AuthenticationError(
      `${label} must be between 1 and 100 characters.`,
      400,
    );
  }

  return name;
}

function validateAvatarUrl(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string" || value.length > 2048) {
    throw new AuthenticationError("Avatar URL must be a valid HTTPS URL.", 400);
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new AuthenticationError("Avatar URL must be a valid HTTPS URL.", 400);
  }

  if (url.protocol !== "https:" || url.username || url.password) {
    throw new AuthenticationError("Avatar URL must be a valid HTTPS URL.", 400);
  }

  return url.href;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    error.code === "SQLITE_CONSTRAINT_UNIQUE"
  );
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function isValidToken(token: string): boolean {
  return TOKEN_PATTERN.test(token);
}

export class AuthenticationService {
  private readonly users: UserModel;
  private readonly authentication: AuthenticationModel;

  constructor(private readonly connection: DatabaseConnection) {
    this.users = new UserModel(connection);
    this.authentication = new AuthenticationModel(connection);
  }

  async register(input: unknown): Promise<AuthenticationSession> {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      throw new AuthenticationError("A JSON object is required.", 400);
    }

    const body = input as Record<string, unknown>;
    const firstName = validateName(body.firstName, "First name");
    const lastName = validateName(body.lastName, "Last name");
    const email = normalizeEmail(body.email);
    const avatarUrl = validateAvatarUrl(body.avatarUrl);
    validatePassword(body.password);

    if (this.users.findByEmail(email)) {
      throw new AuthenticationError(
        "An account with that email already exists.",
        409,
      );
    }

    const passwordHash = await hashPassword(body.password);
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    try {
      const createAccountAndSession = this.connection.db.$client.transaction(
        () => {
          const user = this.users.create({
            firstName,
            lastName,
            email,
            avatarUrl,
          });
          this.authentication.createCredential(user.id, passwordHash);
          this.authentication.createSession({
            tokenHash: hashToken(token),
            userId: user.id,
            expiresAt,
          });
          return user;
        },
      );

      const user = createAccountAndSession();
      this.authentication.deleteExpiredSessions();
      return { user, token, expiresAt };
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AuthenticationError(
          "An account with that email already exists.",
          409,
        );
      }
      throw error;
    }
  }

  async login(input: unknown): Promise<AuthenticationSession> {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      throw new AuthenticationError("A JSON object is required.", 400);
    }

    const body = input as Record<string, unknown>;
    const email = normalizeEmail(body.email);
    if (
      typeof body.password !== "string" ||
      Buffer.byteLength(body.password, "utf8") > 1024
    ) {
      throw new AuthenticationError("Invalid email or password.", 401);
    }

    const user = this.users.findByEmail(email);
    const credential = user
      ? this.authentication.findCredentialByUserId(user.id)
      : undefined;
    const passwordMatches = credential
      ? await verifyPassword(body.password, credential.passwordHash)
      : await hashPassword(body.password).then(() => false);

    if (!user || !credential || !passwordMatches) {
      throw new AuthenticationError("Invalid email or password.", 401);
    }

    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    this.authentication.deleteExpiredSessions();
    this.authentication.createSession({
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt,
    });

    return { user, token, expiresAt };
  }

  authenticate(token: string | undefined): User | undefined {
    if (!token || !isValidToken(token)) {
      return undefined;
    }

    const tokenHash = hashToken(token);
    const session = this.authentication.findSessionByTokenHash(tokenHash);
    if (!session) {
      return undefined;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      this.authentication.deleteSessionByTokenHash(tokenHash);
      return undefined;
    }

    return this.users.findById(session.userId);
  }

  updateAvatar(userId: string, value: unknown): User {
    const avatarUrl = validateAvatarUrl(value);
    const user = this.users.update(userId, { avatarUrl });
    if (!user) {
      throw new AuthenticationError("User account was not found.", 404);
    }

    return user;
  }

  logout(token: string | undefined): void {
    if (token && isValidToken(token)) {
      this.authentication.deleteSessionByTokenHash(hashToken(token));
    }
  }
}
