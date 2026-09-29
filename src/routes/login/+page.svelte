<script lang="ts">
import { type PublicKeyCredentialRequestOptionsJSON, startAuthentication } from "@simplewebauthn/browser";
import { dev } from "$app/environment";
import { goto } from "$app/navigation";
import { postJSON } from "$lib/api";

let busy = $state(false);
let message = $state("");

async function login() {
	busy = true;
	message = "";
	try {
		const optionsJSON = await postJSON<PublicKeyCredentialRequestOptionsJSON>("/login/options");
		const response = await startAuthentication({ optionsJSON });
		await postJSON("/login/verify", response);
		await goto("/", { invalidateAll: true });
	} catch (e) {
		message = e instanceof Error ? e.message : String(e);
	} finally {
		busy = false;
	}
}
</script>

<svelte:head>
	<title>ログイン | ぽちファイル便</title>
</svelte:head>

<h1>ログイン</h1>
<p>このサイトは招待されたユーザーだけが利用できます。</p>
<button type="button" onclick={login} disabled={busy}>パスキーでログイン</button>
{#if message}
	<p role="alert">{message}</p>
{/if}
{#if dev}
	<form method="POST" action="/login/dev">
		<p>開発用ログイン</p>
		<button type="submit" name="role" value="owner">オーナー</button>
		<button type="submit" name="role" value="guest">ゲスト</button>
	</form>
{/if}
