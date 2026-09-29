import { isoBase64URL } from "@simplewebauthn/server/helpers";

export const DAY = 24 * 60 * 60 * 1000;

export function generateToken(): string {
	return isoBase64URL.fromBuffer(crypto.getRandomValues(new Uint8Array(32)));
}

// Store only hashes so a leaked database cannot be used to hijack sessions or invites
export async function hashToken(token: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
	return isoBase64URL.fromBuffer(new Uint8Array(digest));
}
