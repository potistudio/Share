<script lang="ts">
import { page } from "$app/state";

let { data, children } = $props();

const NAV = [
	{ href: "/admin", label: "概要" },
	{ href: "/admin/invites", label: "招待" },
	{ href: "/admin/users", label: "ユーザー" },
];
</script>

<div class="admin">
	<nav aria-label="管理メニュー">
		<p class="brand">ぽちファイル便 <span>管理</span></p>
		<ul>
			{#each NAV as item (item.href)}
				<li>
					<a href={item.href} aria-current={page.url.pathname === item.href ? "page" : undefined}
						>{item.label}</a
					>
				</li>
			{/each}
		</ul>
		<div class="account">
			<p>{data.user?.name}</p>
			<a href="/">サイトに戻る</a>
			<form method="POST" action="/logout">
				<button type="submit">ログアウト</button>
			</form>
		</div>
	</nav>
	<main>
		{@render children()}
	</main>
</div>

<style>
:global(body:has(.admin)) {
	margin: 0;
}

.admin {
	--surface: #fcfcfb;
	--plane: #f9f9f7;
	--ink: #0b0b0b;
	--ink-2: #52514e;
	--muted: #898781;
	--hairline: #e1e0d9;
	--border: rgba(11, 11, 11, 0.1);
	--good: #006300;
	--critical: #d03b3b;

	display: grid;
	grid-template-columns: 200px 1fr;
	min-height: 100vh;
	color: var(--ink);
	background: var(--plane);
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	color-scheme: light;
}

@media (prefers-color-scheme: dark) {
	.admin {
		--surface: #1a1a19;
		--plane: #0d0d0d;
		--ink: #ffffff;
		--ink-2: #c3c2b7;
		--hairline: #2c2c2a;
		--border: rgba(255, 255, 255, 0.1);
		--good: #0ca30c;
		--critical: #ec6a6a;

		color-scheme: dark;
	}
}

nav {
	position: sticky;
	top: 0;
	display: flex;
	flex-direction: column;
	gap: 16px;
	height: 100vh;
	box-sizing: border-box;
	padding: 20px 12px;
	background: var(--surface);
	border-right: 1px solid var(--hairline);
}

.brand {
	margin: 0 8px;
	font-weight: 600;
}

.brand span {
	color: var(--muted);
	font-weight: 400;
}

ul {
	display: flex;
	flex-direction: column;
	gap: 2px;
	margin: 0;
	padding: 0;
	list-style: none;
}

nav a {
	color: var(--ink-2);
	text-decoration: none;
}

ul a {
	display: block;
	padding: 8px;
	border-radius: 6px;
}

ul a:hover {
	background: var(--plane);
}

ul a[aria-current="page"] {
	color: var(--ink);
	font-weight: 600;
	background: var(--plane);
}

.account {
	display: flex;
	flex-direction: column;
	gap: 8px;
	align-items: flex-start;
	margin-top: auto;
	padding: 0 8px;
	font-size: 0.875rem;
}

.account p {
	margin: 0;
	color: var(--muted);
}

main {
	min-width: 0;
	padding: 24px 32px 48px;
}

@media (max-width: 720px) {
	.admin {
		grid-template-rows: auto 1fr;
		grid-template-columns: 1fr;
	}

	nav {
		position: static;
		flex-flow: row wrap;
		align-items: center;
		height: auto;
		border-right: none;
		border-bottom: 1px solid var(--hairline);
	}

	ul {
		flex-direction: row;
	}

	.account {
		flex-direction: row;
		align-items: center;
		margin: 0 0 0 auto;
	}

	main {
		padding: 16px;
	}
}

/* Shared building blocks for the admin pages */

main :global(h1) {
	margin: 0 0 20px;
	font-size: 1.5rem;
}

main :global(h2) {
	margin: 0 0 12px;
	font-size: 1rem;
}

main :global(.card) {
	padding: 16px;
	background: var(--surface);
	border: 1px solid var(--border);
	border-radius: 8px;
}

main :global(.card + .card) {
	margin-top: 16px;
}

main :global(.empty) {
	margin: 0;
	color: var(--muted);
}

main :global(.table-wrap) {
	overflow-x: auto;
}

main :global(table) {
	width: 100%;
	border-collapse: collapse;
	font-size: 0.875rem;
}

main :global(th) {
	padding: 8px;
	color: var(--muted);
	font-weight: 400;
	text-align: left;
	white-space: nowrap;
}

main :global(td) {
	padding: 8px;
	white-space: nowrap;
	border-top: 1px solid var(--hairline);
}

main :global(.visually-hidden) {
	position: absolute;
	width: 1px;
	height: 1px;
	overflow: hidden;
	clip-path: inset(50%);
	white-space: nowrap;
}

main :global(td.actions) {
	text-align: right;
}

main :global(input:not([type="hidden"])),
main :global(select) {
	padding: 6px 8px;
	font: inherit;
	color: inherit;
	background: var(--plane);
	border: 1px solid var(--border);
	border-radius: 6px;
}

.admin :global(button) {
	padding: 6px 12px;
	font: inherit;
	color: var(--ink);
	cursor: pointer;
	background: var(--surface);
	border: 1px solid var(--border);
	border-radius: 6px;
}

.admin :global(button:hover) {
	background: var(--plane);
}

.admin :global(button.primary) {
	color: var(--surface);
	background: var(--ink);
	border-color: var(--ink);
}

.admin :global(button.danger) {
	color: var(--critical);
}
</style>
