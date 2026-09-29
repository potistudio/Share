<script lang="ts">
import { enhance } from "$app/forms";
import InviteStatus from "$lib/admin/InviteStatus.svelte";
import { formatDateTime } from "$lib/format";

let { data, form } = $props();

let copied = $state(false);

async function copy(url: string) {
	await navigator.clipboard.writeText(url);
	copied = true;
}
</script>

<svelte:head>
	<title>招待 | 管理 | ぽちファイル便</title>
</svelte:head>

<h1>招待</h1>

<section class="card">
	<h2>招待リンクを作成</h2>
	<form
		class="create"
		method="POST"
		action="?/create"
		use:enhance={() => {
	copied = false;
	return ({ update }) => update();
}}
	>
		<label>
			メモ（誰宛てか）
			<input name="note" maxlength="100">
		</label>
		<label>
			有効期限
			<select name="days">
				{#each data.inviteTtlDays as days (days)}
					<option value={days} selected={days === 7}>{days}日</option>
				{/each}
			</select>
		</label>
		<button type="submit" class="primary">作成</button>
	</form>
	{#if form?.inviteUrl}
		<div class="result">
			<p>招待リンクを作成しました。このリンクは一度しか表示されないので、今のうちに相手へ送ってください。</p>
			<div class="url">
				<input
					readonly
					value={form.inviteUrl}
					aria-label="招待リンク"
					onfocus={(e) => e.currentTarget.select()}
				>
				<button type="button" onclick={() => copy(form.inviteUrl)}>
					{copied ? "コピーしました" : "コピー"}
				</button>
			</div>
		</div>
	{:else if form?.message}
		<p role="alert">{form.message}</p>
	{/if}
</section>

<section class="card">
	<h2>招待一覧</h2>
	{#if data.invites.length > 0}
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>メモ</th>
						<th>状態</th>
						<th>有効期限</th>
						<th>登録したユーザー</th>
						<th>作成日時</th>
						<th><span class="visually-hidden">操作</span></th>
					</tr>
				</thead>
				<tbody>
					{#each data.invites as invite (invite.id)}
						<tr>
							<td>{invite.note || "-"}</td>
							<td><InviteStatus usedAt={invite.usedAt} expiresAt={invite.expiresAt} now={data.now} /></td>
							<td>{formatDateTime(invite.expiresAt)}</td>
							<td>{invite.usedAt === null ? "-" : (invite.usedByName ?? "削除済みユーザー")}</td>
							<td>{formatDateTime(invite.createdAt)}</td>
							<td class="actions">
								{#if invite.usedAt === null}
									<form method="POST" action="?/revoke" use:enhance>
										<input type="hidden" name="id" value={invite.id}>
										<button type="submit" class="danger">取り消し</button>
									</form>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="empty">まだ招待はありません</p>
	{/if}
</section>

<style>
.create {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
	align-items: flex-end;
}

label {
	display: flex;
	flex-direction: column;
	gap: 4px;
	color: var(--ink-2);
	font-size: 0.875rem;
}

.result {
	margin-top: 16px;
	padding-top: 16px;
	border-top: 1px solid var(--hairline);
}

.result p {
	margin: 0 0 8px;
	font-size: 0.875rem;
}

.url {
	display: flex;
	gap: 8px;
}

.url input {
	flex: 1;
	min-width: 0;
}
</style>
