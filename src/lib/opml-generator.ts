import { categorizedFeeds, Feed } from "@/data/feeds";
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
export function generateAndDownloadOpml() {
  let opmlBody = '';
  for (const category in categorizedFeeds) {
    opmlBody += `    <outline text="${escapeXml(category)}">\n`;
    categorizedFeeds[category].forEach((feed: Feed) => {
      opmlBody += `      <outline type="rss" title="${escapeXml(feed.title)}" xmlUrl="${escapeXml(feed.url)}"/>\n`;
    });
    opmlBody += `    </outline>\n`;
  }
  const opmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Lehigh Valley Master Intelligence Feed</title>
    <dateCreated>${new Date().toUTCString()}</dateCreated>
    <ownerName>LV Intelligence Project</ownerName>
  </head>
  <body>
${opmlBody}
  </body>
</opml>`;
  const blob = new Blob([opmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lehigh-valley-feeds.opml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}