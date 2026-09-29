# My Share Platform

Invite-only: every page requires a passkey login, and new users can only join through an invite link.

## Setup

```sh
pnpm install
pnpm db:migrate      # or db:migrate:remote
pnpm invite:owner    # or invite:owner --remote
```

Open the printed link to register the first owner. Further invites are issued from `/admin`.
