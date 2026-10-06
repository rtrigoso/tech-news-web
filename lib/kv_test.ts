import { assertEquals } from "jsr:@std/assert@^1.0.0";
import { hasMeaningfulChange } from "./kv.ts";
import type { Article } from "./types.ts";

function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: 1,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    title: "Test Article",
    created_by: "user",
    upvotes_count: 100,
    comments_count: 20,
    score: 0.5,
    description: "",
    url: "https://example.com",
    ...overrides,
  };
}

Deno.test("hasMeaningfulChange - false when articles are identical", () => {
  const a = makeArticle();
  const b = makeArticle();
  assertEquals(hasMeaningfulChange(a, b), false);
});

Deno.test("hasMeaningfulChange - false when only description differs", () => {
  const a = makeArticle({ description: "" });
  const b = makeArticle({ description: "scraped description" });
  assertEquals(hasMeaningfulChange(a, b), false);
});

Deno.test("hasMeaningfulChange - false when only updated_at differs", () => {
  const a = makeArticle({ updated_at: "2026-01-01T00:00:00.000Z" });
  const b = makeArticle({ updated_at: "2026-01-02T00:00:00.000Z" });
  assertEquals(hasMeaningfulChange(a, b), false);
});

Deno.test("hasMeaningfulChange - true when title differs", () => {
  const a = makeArticle({ title: "Old Title" });
  const b = makeArticle({ title: "New Title" });
  assertEquals(hasMeaningfulChange(a, b), true);
});

Deno.test("hasMeaningfulChange - true when upvotes_count differs", () => {
  const a = makeArticle({ upvotes_count: 100 });
  const b = makeArticle({ upvotes_count: 150 });
  assertEquals(hasMeaningfulChange(a, b), true);
});

Deno.test("hasMeaningfulChange - true when comments_count differs", () => {
  const a = makeArticle({ comments_count: 20 });
  const b = makeArticle({ comments_count: 25 });
  assertEquals(hasMeaningfulChange(a, b), true);
});

Deno.test("hasMeaningfulChange - true when score differs", () => {
  const a = makeArticle({ score: 0.5 });
  const b = makeArticle({ score: 0.6 });
  assertEquals(hasMeaningfulChange(a, b), true);
});

Deno.test("hasMeaningfulChange - true when url differs", () => {
  const a = makeArticle({ url: "https://example.com/a" });
  const b = makeArticle({ url: "https://example.com/b" });
  assertEquals(hasMeaningfulChange(a, b), true);
});

Deno.test("hasMeaningfulChange - true when top_comment goes from undefined to present", () => {
  const a = makeArticle({ top_comment: undefined });
  const b = makeArticle({
    top_comment: { id: 1, author: "user", content: "comment" },
  });
  assertEquals(hasMeaningfulChange(a, b), true);
});

Deno.test("hasMeaningfulChange - true when top_comment content differs", () => {
  const a = makeArticle({
    top_comment: { id: 1, author: "user", content: "old" },
  });
  const b = makeArticle({
    top_comment: { id: 1, author: "user", content: "new" },
  });
  assertEquals(hasMeaningfulChange(a, b), true);
});

Deno.test("hasMeaningfulChange - false when top_comment is identical", () => {
  const topComment = { id: 1, author: "user", content: "same" };
  const a = makeArticle({ top_comment: { ...topComment } });
  const b = makeArticle({ top_comment: { ...topComment } });
  assertEquals(hasMeaningfulChange(a, b), false);
});
