import { Feed } from "@/stores/useFeedsStore";
export interface FeedWithCategory extends Feed {
  category: string;
}
/**
 * Escapes a string for use in a CSV file.
 * It handles quotes by doubling them and wraps the string in quotes if it contains commas, quotes, or newlines.
 * @param value The string to escape.
 * @returns The escaped string.
 */
function escapeCsvValue(value: string): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
/**
 * Generates a CSV file from feed data and triggers a download in the browser.
 * @param feeds An array of feed objects, each including a 'category'.
 */
export function generateCsvDownload(feeds: FeedWithCategory[]) {
  const header = 'Title,URL,Category\n';
  const rows = feeds
    .map(f =>
      [
        escapeCsvValue(f.title),
        escapeCsvValue(f.url),
        escapeCsvValue(f.category)
      ].join(',')
    )
    .join('\n');
  const csvContent = header + rows;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lehigh-valley-feeds.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}