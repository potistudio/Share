<script lang="ts">
let { label, value, note }: { label: string; value: number; note?: string } = $props();
</script>

<div class="tile">
	<p class="label">{label}</p>
	<p class="value">{value.toLocaleString("ja-JP")}</p>
	{#if note}
		<p class="note">{note}</p>
	{/if}
</div>

<style>
.tile {
	padding: 16px;
	background: var(--surface);
	border: 1px solid var(--border);
	border-radius: 8px;
}

p {
	margin: 0;
}

.label {
	color: var(--ink-2);
	font-size: 0.875rem;
}

.value {
	margin-top: 4px;
	font-size: 2rem;
	font-weight: 600;
	line-height: 1.2;
}

.note {
	margin-top: 4px;
	color: var(--muted);
	font-size: 0.8125rem;
}
</style>
