import type { HNStory } from "./hn.ts";
import { fetchTopStories } from "./hn.ts";
import { wilsonScore } from "./wilson.ts";
import { upsertTopArticles } from "./kv.ts";
import type { Article } from "./types.ts";

export function mapStoriesToArticles(stories: HNStory[]): Article[] {
  return stories
    .filter((s) => s.type === "story" && s.url && s.score !== undefined)
    .map((s) => {
      const upvotes = s.score;
      const downvotes = s.descendants ?? 0;
      return {
        id: s.id,
        title: s.title,
        url: s.url!,
        created_by: s.by,
        upvotes_count: upvotes,
        comments_count: downvotes,
        score: wilsonScore(upvotes, downvotes),
        created_at: new Date(s.time * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        description: s.text ?? "",
      };
    });
}

export async function ingestTopStories(): Promise<void> {
  console.log("[ingest] fetching HN top stories");
  const stories = await fetchTopStories();
  const articles = mapStoriesToArticles(stories);
  const top100 = articles.sort((a, b) => b.score - a.score).slice(0, 100);
  console.log(`[ingest] storing ${top100.length} articles`);
  await upsertTopArticles(top100);
  console.log("[ingest] done");
}
