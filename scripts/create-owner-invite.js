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

// The site allows a single owner, so the invite is only inserted while none exists
const sql = `INSERT INTO invites (id, token_hash, role, note, created_at, expires_at)
SELECT '${randomUUID()}', '${tokenHash}', 'owner', 'bootstrap', ${now}, ${now + DAY}
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'owner')
RETURNING id;`;

const output = execFileSync(
	process.execPath,
	[
		"node_modules/wrangler/bin/wrangler.js",
		"d1",
		"execute",
		"DB",
		remote ? "--remote" : "--local",
		"--json",
		"--command",
		sql,
	],
	{ encoding: "utf8", stdio: ["inherit", "pipe", "inherit"] },
);

if (JSON.parse(output)[0].results.length === 0) {
	console.error("An owner already exists. Only one owner is allowed.");
	process.exit(1);
}

console.log(`Owner invite (valid for 24 hours):\n${origin}/invite/${token}`);
