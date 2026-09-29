import type { Cookies } from "@sveltejs/kit";
import { DAY, generateToken, hashToken } from "./token";
import type { User } from "./user";

const SESSION_COOKIE = "session";
const SESSION_TTL = 30 * DAY;
const SESSION_RENEW_THRESHOLD = 15 * DAY;

export async function createSession(db: D1Database, cookies: Cookies, userId: string): Promise<void> {
	const token = generateToken();
	const now = Date.now();
	const expiresAt = now + SESSION_TTL;
	await db.batch([
		db.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(now),
		db
			.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
			.bind(await hashToken(token), userId, expiresAt),
	]);
	setSessionCookie(cookies, token, expiresAt);
}

export async function validateSession(db: D1Database, cookies: Cookies): Promise<User | null> {
	const token = cookies.get(SESSION_COOKIE);
	if (!token) return null;

	const id = await hashToken(token);
	const row = await db
		.prepare(
			"SELECT s.expires_at, u.id, u.name, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?",
		)
		.bind(id)
		.first<User & { expires_at: number }>();

	const now = Date.now();
	if (!row || row.expires_at <= now) {
		if (row) await db.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
		cookies.delete(SESSION_COOKIE, { path: "/" });
		return null;
	}

	if (row.expires_at - now < SESSION_RENEW_THRESHOLD) {
		const expiresAt = now + SESSION_TTL;
		await db.prepare("UPDATE sessions SET expires_at = ? WHERE id = ?").bind(expiresAt, id).run();
		setSessionCookie(cookies, token, expiresAt);
	}

	return { id: row.id, name: row.name, role: row.role };
}

export async function invalidateSession(db: D1Database, cookies: Cookies): Promise<void> {
	const token = cookies.get(SESSION_COOKIE);
	if (token)
		await db
			.prepare("DELETE FROM sessions WHERE id = ?")
			.bind(await hashToken(token))
			.run();
	cookies.delete(SESSION_COOKIE, { path: "/" });
}

export async function countActiveSessions(db: D1Database): Promise<number> {
	const row = await db
		.prepare("SELECT COUNT(*) AS count FROM sessions WHERE expires_at > ?")
		.bind(Date.now())
		.first<{ count: number }>();
	return row?.count ?? 0;
}

function setSessionCookie(cookies: Cookies, token: string, expiresAt: number): void {
	cookies.set(SESSION_COOKIE, token, {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		expires: new Date(expiresAt),
	});
}
