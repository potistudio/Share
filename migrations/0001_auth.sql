CREATE TABLE users (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	role TEXT NOT NULL CHECK (role IN ('owner', 'guest')),
	created_at INTEGER NOT NULL
);

CREATE TABLE credentials (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	public_key TEXT NOT NULL,
	counter INTEGER NOT NULL,
	transports TEXT,
	created_at INTEGER NOT NULL,
	last_used_at INTEGER
);

CREATE INDEX credentials_user_id ON credentials (user_id);

CREATE TABLE invites (
	id TEXT PRIMARY KEY,
	token_hash TEXT NOT NULL UNIQUE,
	role TEXT NOT NULL CHECK (role IN ('owner', 'guest')),
	note TEXT NOT NULL DEFAULT '',
	created_by TEXT REFERENCES users (id) ON DELETE SET NULL,
	created_at INTEGER NOT NULL,
	expires_at INTEGER NOT NULL,
	used_at INTEGER,
	used_by TEXT REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE sessions (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	expires_at INTEGER NOT NULL
);

CREATE INDEX sessions_user_id ON sessions (user_id);

CREATE TABLE auth_challenges (
	challenge TEXT PRIMARY KEY,
	data TEXT NOT NULL,
	expires_at INTEGER NOT NULL
);
