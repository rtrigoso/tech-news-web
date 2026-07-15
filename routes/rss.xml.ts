import { Handlers } from "$fresh/server.ts";
import { getTopArticles } from "../lib/kv.ts";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const handler: Handlers = {
  async GET(req, _ctx) {
    const articles = await getTopArticles();
    const baseUrl = new URL(req.url).origin;

    const items = articles
      .map((article) => {
        const pubDate = new Date(article.created_at).toUTCString();
        const description = article.description || article.title;
        return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(article.url)}</link>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">hn-${article.id}</guid>
      <comments>${escapeXml(`https://news.ycombinator.com/item?id=${article.id}`)}</comments>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HN Focus</title>
    <link>${baseUrl}</link>
    <description>Top Hacker News articles focusing on computer science</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${baseUrl}/rss.xml`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  },
};
