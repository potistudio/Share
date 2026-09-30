# My Share Platform

Invite-only: every page requires a passkey login, and new users can only join through an invite link.

## Setup

```sh
pnpm install
pnpm db:migrate      # or db:migrate:remote
pnpm invite:owner    # or invite:owner --remote
```

Open the printed link to register the owner. The site has exactly one owner, so `invite:owner` refuses once one exists. Guest invites are issued from `/admin`.
