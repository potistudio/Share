<script lang="ts">
let { data } = $props();

const title = "ぽちファイル便";
const description = "ぽちのファイル共有システム";
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description}>

	<meta property="og:title" content={title}>
	<meta property="og:description" content={description}>
	<meta property="og:site_name" content={title}>
	<meta property="og:url" content="https://share.poti.studio/">
	<meta property="og:type" content="website">
</svelte:head>

<h1>{title}</h1>
{#if data.user}
	<p>こんにちは、{data.user.name} さん</p>
	{#if data.user.role === "owner"}
		<p><a href="/admin">管理ダッシュボード</a></p>
	{/if}
	<form method="POST" action="/logout">
		<button type="submit">ログアウト</button>
	</form>
{/if}
