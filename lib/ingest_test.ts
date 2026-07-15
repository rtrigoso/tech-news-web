import { assert, assertEquals } from "jsr:@std/assert@^1.0.0";
import { mapStoriesToArticles } from "./ingest.ts";
import type { HNStory } from "./hn.ts";

function makeStory(overrides: Partial<HNStory> = {}): HNStory {
  return {
    id: 1,
    type: "story",
    title: "Test Article",
    url: "https://example.com",
    by: "user",
    score: 100,
    descendants: 20,
    time: 1700000000,
    ...overrides,
  };
}

Deno.test("mapStoriesToArticles - filters out non-story types", () => {
  const stories = [makeStory({ type: "job" }), makeStory({ type: "poll" })];
  assertEquals(mapStoriesToArticles(stories).length, 0);
});

Deno.test("mapStoriesToArticles - filters out stories without a url", () => {
  const stories = [makeStory({ url: undefined })];
  assertEquals(mapStoriesToArticles(stories).length, 0);
});

Deno.test("mapStoriesToArticles - maps valid story to Article shape", () => {
  const story = makeStory({ id: 42, score: 200, descendants: 30 });
  const [article] = mapStoriesToArticles([story]);
  assertEquals(article.id, 42);
  assertEquals(article.upvotes_count, 200);
  assertEquals(article.comments_count, 30);
  assertEquals(article.url, "https://example.com");
  assertEquals(article.created_by, "user");
});

Deno.test("mapStoriesToArticles - defaults missing descendants to 0", () => {
  const story = makeStory({ descendants: undefined });
  const [article] = mapStoriesToArticles([story]);
  assertEquals(article.comments_count, 0);
});

Deno.test("mapStoriesToArticles - converts unix timestamp to ISO string", () => {
  const story = makeStory({ time: 1700000000 });
  const [article] = mapStoriesToArticles([story]);
  assertEquals(article.created_at, new Date(1700000000 * 1000).toISOString());
});

Deno.test("mapStoriesToArticles - score is a number between 0 and 1", () => {
  const story = makeStory({ score: 150, descendants: 40 });
  const [article] = mapStoriesToArticles([story]);
  assert(article.score >= 0 && article.score <= 1);
});

Deno.test("mapStoriesToArticles - defaults missing text to empty string", () => {
  const story = makeStory({ text: undefined });
  const [article] = mapStoriesToArticles([story]);
  assertEquals(article.description, "");
});
