import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { ObjectId } from "mongodb";

const scrypt = promisify(scryptCallback);
const cookieName = "todo_session";
const sessionSeconds = 60 * 60 * 24 * 7;

function getSecret() {
  if (!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET is required");
  return process.env.AUTH_SECRET;
}

function sign(payload) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `${salt.toString("hex")}:${Buffer.from(hash).toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  const [saltHex, hashHex] = storedHash.split(":");
  const expected = Buffer.from(hashHex || "", "hex");
  if (!saltHex || expected.length !== 64) return false;

  const actual = Buffer.from(
    await scrypt(password, Buffer.from(saltHex, "hex"), expected.length),
  );
  return timingSafeEqual(expected, actual);
}

export function setSessionCookie(response, userId) {
  const expires = Math.floor(Date.now() / 1000) + sessionSeconds;
  const payload = `${userId}.${expires}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${cookieName}=${payload}.${sign(payload)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${sessionSeconds}${secure}`,
  );
}

export function clearSessionCookie(response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${cookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`,
  );
}

export function getSessionUserId(request) {
  const cookie = request.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));
  const token = cookie?.slice(cookieName.length + 1);
  if (!token) return null;

  const [id, expiresText, providedSignature, ...extra] = token.split(".");
  const expires = Number(expiresText);
  if (
    extra.length ||
    !ObjectId.isValid(id) ||
    !Number.isFinite(expires) ||
    expires <= Date.now() / 1000
  ) {
    return null;
  }

  const payload = `${id}.${expiresText}`;
  const expected = Buffer.from(sign(payload), "base64url");
  const provided = Buffer.from(providedSignature || "", "base64url");
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return null;
  }

  return new ObjectId(id);
}
