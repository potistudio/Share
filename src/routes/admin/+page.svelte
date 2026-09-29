<script lang="ts">
import type { SubmitFunction } from "@sveltejs/kit";
import { enhance } from "$app/forms";

let { data, form } = $props();

const formatDate = (time: number) => new Date(time).toLocaleString("ja-JP");

function inviteStatus(invite: (typeof data.invites)[number]) {
	if (invite.usedAt) return `使用済み（${invite.usedByName ?? "削除済みユーザー"}）`;
	if (invite.expiresAt <= data.now) return "期限切れ";
	return `${formatDate(invite.expiresAt)} まで有効`;
}

function confirmDelete(name: string): SubmitFunction {
	return ({ cancel }) => {
		if (!confirm(`${name} さんを削除しますか？すぐにアクセスできなくなります。`)) cancel();
	};
}
</script>

<svelte:head>
	<title>管理 | ぽちファイル便</title>
</svelte:head>

<h1>招待とユーザーの管理</h1>
<p><a href="/">トップへ戻る</a></p>

<h2>招待リンクを作成</h2>
<form method="POST" action="?/createInvite" use:enhance>
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
	<button type="submit">作成</button>
</form>
{#if form?.inviteUrl}
	<p>招待リンクを作成しました。このリンクは一度しか表示されません。</p>
	<input readonly value={form.inviteUrl} size="80" onfocus={(e) => e.currentTarget.select()}>
{:else if form?.message}
	<p role="alert">{form.message}</p>
{/if}

<h2>招待一覧</h2>
<table>
	<thead>
		<tr>
			<th>メモ</th>
			<th>作成日時</th>
			<th>状態</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each data.invites as invite (invite.id)}
			<tr>
				<td>{invite.note || "-"}</td>
				<td>{formatDate(invite.createdAt)}</td>
				<td>{inviteStatus(invite)}</td>
				<td>
					{#if !invite.usedAt}
						<form method="POST" action="?/revokeInvite" use:enhance>
							<input type="hidden" name="id" value={invite.id}>
							<button type="submit">取り消し</button>
						</form>
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<h2>ユーザー一覧</h2>
<table>
	<thead>
		<tr>
			<th>名前</th>
			<th>権限</th>
			<th>登録日時</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each data.users as user (user.id)}
			<tr>
				<td>{user.name}</td>
				<td>{user.role === "owner" ? "オーナー" : "ゲスト"}</td>
				<td>{formatDate(user.createdAt)}</td>
				<td>
					{#if user.role === "guest"}
						<form method="POST" action="?/deleteUser" use:enhance={confirmDelete(user.name)}>
							<input type="hidden" name="id" value={user.id}>
							<button type="submit">削除</button>
						</form>
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
</table>
