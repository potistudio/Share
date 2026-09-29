<script lang="ts">
import StatTile from "$lib/admin/StatTile.svelte";
import { formatDateTime } from "$lib/format";

let { data } = $props();
</script>

<svelte:head>
	<title>概要 | 管理 | ぽちファイル便</title>
</svelte:head>

<h1>概要</h1>

<div class="stats">
	<StatTile
		label="ユーザー"
		value={data.stats.owners + data.stats.guests}
		note={`オーナー ${data.stats.owners}・ゲスト ${data.stats.guests}`}
	/>
	<StatTile label="直近7日の新規登録" value={data.stats.newUsers} />
	<StatTile label="有効な招待" value={data.stats.activeInvites} />
	<StatTile label="ログイン中のセッション" value={data.stats.activeSessions} />
</div>

<div class="panels">
	<section class="card">
		<header>
			<h2>最近の登録</h2>
			<a href="/admin/users">すべて見る</a>
		</header>
		{#if data.recentUsers.length > 0}
			<ul>
				{#each data.recentUsers as user (user.id)}
					<li>
						<span>{user.name}</span>
						<span class="meta">{formatDateTime(user.createdAt)}</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="empty">まだユーザーはいません</p>
		{/if}
	</section>

	<section class="card">
		<header>
			<h2>有効な招待</h2>
			<a href="/admin/invites">招待を作成</a>
		</header>
		{#if data.activeInvites.length > 0}
			<ul>
				{#each data.activeInvites as invite (invite.id)}
					<li>
						<span>{invite.note || "（メモなし）"}</span>
						<span class="meta">{formatDateTime(invite.expiresAt)} まで</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="empty">有効な招待はありません</p>
		{/if}
	</section>
</div>

<style>
.stats {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	gap: 16px;
	margin-bottom: 24px;
}

.panels {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
	gap: 16px;
	align-items: start;
}

.panels :global(.card + .card) {
	margin-top: 0;
}

header {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	font-size: 0.875rem;
}

header a {
	color: var(--ink-2);
}

ul {
	margin: 0;
	padding: 0;
	list-style: none;
}

li {
	display: flex;
	gap: 12px;
	justify-content: space-between;
	padding: 8px 0;
	border-top: 1px solid var(--hairline);
}

.meta {
	display: inline-flex;
	gap: 8px;
	color: var(--muted);
	font-size: 0.875rem;
	white-space: nowrap;
}
</style>
