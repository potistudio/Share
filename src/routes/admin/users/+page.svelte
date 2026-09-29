<script lang="ts">
import type { SubmitFunction } from "@sveltejs/kit";
import { enhance } from "$app/forms";
import { formatDateTime } from "$lib/format";

let { data } = $props();

function confirmDelete(name: string): SubmitFunction {
	return ({ cancel }) => {
		if (!confirm(`${name} さんを削除しますか？すぐにアクセスできなくなります。`)) cancel();
	};
}
</script>

<svelte:head>
	<title>ユーザー | 管理 | ぽちファイル便</title>
</svelte:head>

<h1>ユーザー</h1>

<section class="card">
	{#if data.users.length > 0}
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>名前</th>
						<th>権限</th>
						<th>登録日時</th>
						<th>最終ログイン</th>
						<th><span class="visually-hidden">操作</span></th>
					</tr>
				</thead>
				<tbody>
					{#each data.users as user (user.id)}
						<tr>
							<td>{user.name}</td>
							<td>{user.role === "owner" ? "オーナー" : "ゲスト"}</td>
							<td>{formatDateTime(user.createdAt)}</td>
							<td>{formatDateTime(user.lastLoginAt)}</td>
							<td class="actions">
								{#if user.role === "guest"}
									<form method="POST" action="?/delete" use:enhance={confirmDelete(user.name)}>
										<input type="hidden" name="id" value={user.id}>
										<button type="submit" class="danger">削除</button>
									</form>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="empty">まだユーザーはいません</p>
	{/if}
</section>
