<script lang="ts">
import { type PublicKeyCredentialCreationOptionsJSON, startRegistration } from "@simplewebauthn/browser";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { postJSON } from "$lib/api";

let { data } = $props();

let name = $state("");
let busy = $state(false);
let message = $state("");

async function register(event: SubmitEvent) {
	event.preventDefault();
	busy = true;
	message = "";
	try {
		const base = `/invite/${page.params.token}`;
		const optionsJSON = await postJSON<PublicKeyCredentialCreationOptionsJSON>(`${base}/options`, { name });
		const response = await startRegistration({ optionsJSON });
		await postJSON(`${base}/verify`, response);
		await goto("/", { invalidateAll: true });
	} catch (e) {
		message = e instanceof Error ? e.message : String(e);
	} finally {
		busy = false;
	}
}
</script>

<svelte:head>
	<title>招待 | ぽちファイル便</title>
</svelte:head>

<h1>ぽちファイル便へようこそ</h1>
<p>表示名を入力して、このデバイスにパスキーを登録してください。</p>
{#if data.role === "owner"}
	<p>このリンクではオーナー（管理者）として登録されます。</p>
{/if}
<form onsubmit={register}>
	<label>
		表示名
		<input bind:value={name} required maxlength="32" autocomplete="nickname">
	</label>
	<button type="submit" disabled={busy}>パスキーを登録</button>
</form>
{#if message}
	<p role="alert">{message}</p>
{/if}
