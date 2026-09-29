<script lang="ts">
let { usedAt, expiresAt, now }: { usedAt: number | null; expiresAt: number; now: number } = $props();

const STATES = {
	active: { icon: "✓", label: "有効" },
	used: { icon: "●", label: "使用済み" },
	expired: { icon: "×", label: "期限切れ" },
};

const status = $derived(STATES[usedAt !== null ? "used" : expiresAt <= now ? "expired" : "active"]);
</script>

<span class="status" class:active={status === STATES.active}>
	<span aria-hidden="true">{status.icon}</span>
	{status.label}
</span>

<style>
.status {
	display: inline-flex;
	gap: 4px;
	align-items: center;
	color: var(--muted);
	white-space: nowrap;
}

.active {
	color: var(--good);
}
</style>
