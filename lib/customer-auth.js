import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

const COOKIE_NAME = "bf_customer_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random value of at least 32 characters.");
  }
  return value;
}

function sign(value) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  if (typeof stored !== "string") return false;
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function attachSessionCookie(response, user) {
  const payload = Buffer.from(JSON.stringify({
    id: Number(user.id),
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  })).toString("base64url");
  const token = `${payload}.${sign(payload)}`;

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export function clearSessionCookie(response) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

async function readSessionId() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  let expected;
  try {
    expected = sign(payload);
  } catch {
    return null;
  }

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!Number.isSafeInteger(decoded.id) || decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded.id;
  } catch {
    return null;
  }
}

export async function getCustomerSession() {
  const id = await readSessionId();
  if (!id) return null;

  const db = getDb();
  const [rows] = await db.execute(
    "SELECT id, full_name, email, phone, role, is_active FROM customer_accounts WHERE id = ? LIMIT 1",
    [id]
  );
  const user = rows[0];
  if (!user || Number(user.is_active) !== 1) return null;

  return {
    id: Number(user.id),
    name: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

export async function requireAdmin() {
  const user = await getCustomerSession();
  return user?.role === "admin" ? user : null;
}
