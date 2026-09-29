export async function postJSON<T>(url: string, body: unknown = {}): Promise<T> {
	const response = await fetch(url, {
		method: "POST",
		headers: { accept: "application/json", "content-type": "application/json" },
		body: JSON.stringify(body),
	});
	const data = (await response.json().catch(() => null)) as (T & { message?: string }) | null;
	if (!response.ok) throw new Error(data?.message ?? `リクエストに失敗しました (${response.status})`);
	return data as T;
}
