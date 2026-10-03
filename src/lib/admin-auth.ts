/**
 * Server-side admin authentication.
 *
 * The admin password lives in a server-only env var (ADMIN_PASSWORD) — never
 * exposed to the browser via VITE_*. The browser sends the candidate password
 * to `verifyAdminPassword`, which compares it server-side and returns a
 * short-lived signed session token. The token is stored client-side but is
 * meaningless without the server validating it on every admin action.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

function getAdminPassword(): string | null {
  return process.env["ADMIN_PASSWORD"] ?? null;
}

/**
 * HMAC-signs a payload using the admin password as the secret key.
 * Returns "timestamp.signature" or null if no password is configured.
 */
async function signToken(timestamp: number): Promise<string | null> {
  const secret = getAdminPassword();
  if (!secret) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const data = new TextEncoder().encode(String(timestamp));
  const sig = await crypto.subtle.sign("HMAC", key, data);
  return `${timestamp}.${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;
}

/** Verifies a token's signature and freshness. */
export async function verifyAdminToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = getAdminPassword();
  if (!secret) return false;

  const [tsStr, sigB64] = token.split(".");
  if (!tsStr || !sigB64) return false;
  const ts = Number(tsStr);
  if (!Number.isFinite(ts)) return false;
  if (Date.now() - ts > SESSION_TTL_MS) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const data = new TextEncoder().encode(tsStr);
  const sigBytes = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
  return crypto.subtle.verify("HMAC", key, sigBytes, data);
}

/** Server function: validates the admin password and returns a signed token. */
export const verifyAdminPassword = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ password: z.string() }).parse(data))
  .handler(async ({ data }): Promise<{ ok: boolean; token?: string; error?: string }> => {
    const expected = getAdminPassword();
    if (!expected) {
      return { ok: false, error: "Admin access is not configured." };
    }
    if (data.password !== expected) {
      return { ok: false, error: "Invalid access code" };
    }
    const token = await signToken(Date.now());
    if (!token) return { ok: false, error: "Could not create session." };
    return { ok: true, token };
  });

/** Server function: checks whether a token is still valid. */
export const checkAdminSession = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ token: z.string() }).parse(data))
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    return { ok: await verifyAdminToken(data.token) };
  });
