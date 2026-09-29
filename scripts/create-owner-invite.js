// Issues an owner invite directly in D1, since no one can use /admin before the first owner exists.
// Usage: pnpm invite:owner [--remote]
import { execFileSync } from "node:child_process";
import { createHash, randomBytes, randomUUID } from "node:crypto";

const DAY = 24 * 60 * 60 * 1000;

const remote = process.argv.includes("--remote");
const origin = remote ? "https://share.poti.studio" : "http://localhost:5173";

// Must match generateToken and hashToken in src/lib/server/token.ts
const token = randomBytes(32).toString("base64url");
const tokenHash = createHash("sha256").update(token).digest("base64url");
const now = Date.now();

const sql = `INSERT INTO invites (id, token_hash, role, note, created_at, expires_at)
VALUES ('${randomUUID()}', '${tokenHash}', 'owner', 'bootstrap', ${now}, ${now + DAY});`;

execFileSync(
	process.execPath,
	["node_modules/wrangler/bin/wrangler.js", "d1", "execute", "DB", remote ? "--remote" : "--local", "--command", sql],
	{ stdio: "inherit" },
);

console.log(`\nOwner invite (valid for 24 hours):\n${origin}/invite/${token}`);
