import { assert, assertEquals } from "jsr:@std/assert@^1.0.0";
import { wilsonScore } from "./wilson.ts";

Deno.test("wilsonScore - returns 0 when both upvotes and downvotes are 0", () => {
  assertEquals(wilsonScore(0, 0), 0);
});

Deno.test("wilsonScore - returns a value between 0 and 1", () => {
  const score = wilsonScore(50, 10);
  assert(score >= 0 && score <= 1);
});

Deno.test("wilsonScore - higher upvote count yields higher score (more confidence)", () => {
  assert(wilsonScore(100, 0) > wilsonScore(1, 0));
});

Deno.test("wilsonScore - more downvotes lowers the score", () => {
  assert(wilsonScore(10, 0) > wilsonScore(10, 5));
});

Deno.test("wilsonScore - perfect upvote ratio with many votes approaches 1", () => {
  const score = wilsonScore(10_000, 0);
  assert(score > 0.99);
});

Deno.test("wilsonScore - equal upvotes and downvotes yields score below 0.5", () => {
  assert(wilsonScore(100, 100) < 0.5);
});
