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

export function hasMeaningfulChange(
  existing: Article,
  incoming: Article,
): boolean {
  return (
    existing.title !== incoming.title ||
    existing.upvotes_count !== incoming.upvotes_count ||
    existing.comments_count !== incoming.comments_count ||
    existing.score !== incoming.score ||
    existing.url !== incoming.url ||
    JSON.stringify(existing.top_comment) !==
      JSON.stringify(incoming.top_comment)
  );
}

async function writeIfChanged(
  kv: Deno.Kv,
  incoming: Article,
  existingEntry: Deno.KvEntryMaybe<Article> | undefined,
): Promise<void> {
  const existingValue = existingEntry?.value;
  if (existingValue && !hasMeaningfulChange(existingValue, incoming)) {
    return;
  }

  const merged: Article = {
    ...incoming,
    description: incoming.description || existingValue?.description || "",
    updated_at: new Date().toISOString(),
  };

  const op = kv.atomic();
  if (existingEntry) {
    op.check(existingEntry);
  } else {
    op.check({ key: ["post", incoming.id], versionstamp: null });
  }
  op.set(["post", incoming.id], merged);

  const res = await op.commit();
  if (!res.ok) {
    console.warn(
      `[kv] skipped write for article ${incoming.id}: concurrent modification`,
    );
  }
}

export async function upsertTopArticles(articles: Article[]): Promise<void> {
  const kv = await openKv();

  const existing = new Map<number, Deno.KvEntryMaybe<Article>>();
  for await (const entry of kv.list<Article>({ prefix: ["post"] })) {
    existing.set(entry.key[1] as number, entry);
  }

  const newIds = new Set(articles.map((a) => a.id));
  const staleIds = [...existing.keys()].filter((id) => !newIds.has(id));

  await Promise.all([
    ...staleIds.map((id) => kv.delete(["post", id])),
    ...articles.map((incoming) =>
      writeIfChanged(kv, incoming, existing.get(incoming.id))
    ),
  ]);
}

export async function getArticlesMissingDescription(
  limit: number,
): Promise<Article[]> {
  const kv = await openKv();
  const candidates: Article[] = [];
  for await (const entry of kv.list<Article>({ prefix: ["post"] })) {
    if (entry.value.description === "") candidates.push(entry.value);
  }
  return candidates
    .sort(
      (a, b) =>
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
    )
    .slice(0, limit);
}

export async function updateArticleDescription(
  id: number,
  description: string,
): Promise<boolean> {
  const kv = await openKv();
  const entry = await kv.get<Article>(["post", id]);
  if (!entry.value) return false;

  const updated: Article = {
    ...entry.value,
    description,
    updated_at: new Date().toISOString(),
  };

  const res = await kv.atomic().check(entry).set(["post", id], updated)
    .commit();
  return res.ok;
}
