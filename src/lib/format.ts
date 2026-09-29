const dateTimeFormat = new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short" });

export function formatDateTime(time: number | null): string {
	return time === null ? "-" : dateTimeFormat.format(time);
}
