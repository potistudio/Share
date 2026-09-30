import { generateToken, hashToken } from "./token";
import type { Role } from "./user";

export type Invite = {
	id: string;
	role: Role;
	note: string;
	createdAt: number;
	expiresAt: number;
	usedAt: number | null;
	usedBy: string | null;
};

export async function createInvite(
	db: D1Database,
	invite: { role: Role; note: string; createdBy: string; ttl: number },
): Promise<string> {
	const token = generateToken();
	const now = Date.now();
	await db
		.prepare(
			"INSERT INTO invites (id, token_hash, role, note, created_by, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
		)
		.bind(
			crypto.randomUUID(),
			await hashToken(token),
			invite.role,
			invite.note,
			invite.createdBy,
			now,
			now + invite.ttl,
		)
		.run();
	return token;
}

// Owner invites only work while no owner exists, since the site allows a single owner
const USABLE =
	"used_at IS NULL AND expires_at > ? AND (role = 'guest' OR NOT EXISTS (SELECT 1 FROM users WHERE role = 'owner'))";

export async function findUsableInvite(db: D1Database, token: string): Promise<Pick<Invite, "id" | "role"> | null> {
	return await db
		.prepare(`SELECT id, role FROM invites WHERE token_hash = ? AND ${USABLE}`)
		.bind(await hashToken(token), Date.now())
		.first<Pick<Invite, "id" | "role">>();
}

// Marks the invite as used atomically, so the same link cannot register two users even under concurrent requests
export async function claimInvite(db: D1Database, id: string): Promise<boolean> {
	const now = Date.now();
	const { meta } = await db
		.prepare(`UPDATE invites SET used_at = ? WHERE id = ? AND ${USABLE}`)
		.bind(now, id, now)
		.run();
	return meta.changes === 1;
}

export async function listInvites(db: D1Database): Promise<(Invite & { usedByName: string | null })[]> {
	const { results } = await db
		.prepare(
			`SELECT i.id, i.role, i.note, i.created_at AS createdAt, i.expires_at AS expiresAt, i.used_at AS usedAt,
				i.used_by AS usedBy, u.name AS usedByName
			FROM invites i LEFT JOIN users u ON u.id = i.used_by
			ORDER BY i.created_at DESC`,
		)
		.all<Invite & { usedByName: string | null }>();
	return results;
}

export async function revokeInvite(db: D1Database, id: string): Promise<void> {
	await db.prepare("DELETE FROM invites WHERE id = ? AND used_at IS NULL").bind(id).run();
}
