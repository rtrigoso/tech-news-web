import type { Article } from "./types.ts";

let _kv: Deno.Kv | undefined;

async function openKv(): Promise<Deno.Kv> {
  if (!_kv) _kv = await Deno.openKv();
  return _kv;
}

export async function getTopArticles(limit = 20): Promise<Article[]> {
  const kv = await openKv();
  const articles: Article[] = [];
  for await (const entry of kv.list<Article>({ prefix: ["post"] })) {
    articles.push(entry.value);
  }
  return articles.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function upsertTopArticles(articles: Article[]): Promise<void> {
  const kv = await openKv();

  const existingIds = new Set<number>();
  for await (const entry of kv.list({ prefix: ["post"] })) {
    existingIds.add(entry.key[1] as number);
  }

  const newIds = new Set(articles.map((a) => a.id));

  for (const id of existingIds) {
    if (!newIds.has(id)) {
      await kv.delete(["post", id]);
    }
  }

  for (let i = 0; i < articles.length; i += 10) {
    const batch = articles.slice(i, i + 10);
    const op = kv.atomic();
    for (const article of batch) {
      op.set(["post", article.id], article);
    }
    await op.commit();
  }
}
