import type { HNStory } from "./hn.ts";
import { fetchStory, fetchTopComment, fetchTopStories } from "./hn.ts";
import { wilsonScore } from "./wilson.ts";
import {
  getArticlesMissingDescription,
  updateArticleDescription,
  upsertTopArticles,
} from "./kv.ts";
import { fetchOgDescription } from "./scrape.ts";
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
        description: "",
      };
    });
}

export async function ingestTopStories(): Promise<void> {
  console.log("[ingest] fetching HN top stories");
  const stories = await fetchTopStories();
  const articles = mapStoriesToArticles(stories);
  const top100 = articles.sort((a, b) => b.score - a.score).slice(0, 100);

  console.log("[ingest] fetching top comments for popular articles");
  const storyById = new Map(stories.map((s) => [s.id, s]));
  await Promise.all(
    top100.map(async (article) => {
      if (article.top_comment) return;
      const { comments_count } = article;
      if (!comments_count || comments_count <= 50) return;
      const kids = storyById.get(article.id)?.kids;
      if (!kids) return;
      const topComment = await fetchTopComment(kids);
      if (topComment) {
        article.top_comment = topComment;
        console.log(`[ingest] added top_comment to article ${article.id}`);
      }
    }),
  );

  console.log(`[ingest] storing ${top100.length} articles`);
  await upsertTopArticles(top100);
  console.log("[ingest] done");
}

export async function backfillDescriptions(limit = 10): Promise<void> {
  const candidates = await getArticlesMissingDescription(limit);
  console.log(`[backfill] ${candidates.length} articles missing description`);

  await Promise.all(
    candidates.map(async (article) => {
      const description = await fetchOgDescription(article.url);
      if (!description) return;
      const updated = await updateArticleDescription(article.id, description);
      if (updated) {
        console.log(`[backfill] updated description for article ${article.id}`);
      }
    }),
  );
}
