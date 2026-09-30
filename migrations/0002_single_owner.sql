-- At most one owner may exist; fails if the database already has more than one
CREATE UNIQUE INDEX users_single_owner ON users (role) WHERE role = 'owner';
