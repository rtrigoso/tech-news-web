import { assertEquals } from "jsr:@std/assert@^1.0.0";
import { extractOgDescription } from "./scrape.ts";

Deno.test("extractOgDescription - finds og:description, property before content", () => {
  const html =
    `<html><head><meta property="og:description" content="Hello world"></head></html>`;
  assertEquals(extractOgDescription(html), "Hello world");
});

Deno.test("extractOgDescription - finds og:description, content before property", () => {
  const html =
    `<html><head><meta content="Hello world" property="og:description"></head></html>`;
  assertEquals(extractOgDescription(html), "Hello world");
});

Deno.test("extractOgDescription - handles single-quoted attributes", () => {
  const html = `<meta property='og:description' content='Hello world'>`;
  assertEquals(extractOgDescription(html), "Hello world");
});

Deno.test("extractOgDescription - is case-insensitive on property value and tag", () => {
  const html = `<META PROPERTY="OG:DESCRIPTION" CONTENT="Hello world">`;
  assertEquals(extractOgDescription(html), "Hello world");
});

Deno.test("extractOgDescription - falls back to meta name=description", () => {
  const html = `<meta name="description" content="Fallback description">`;
  assertEquals(extractOgDescription(html), "Fallback description");
});

Deno.test("extractOgDescription - prefers og:description over name=description", () => {
  const html = `<meta name="description" content="Fallback">
    <meta property="og:description" content="OG wins">`;
  assertEquals(extractOgDescription(html), "OG wins");
});

Deno.test("extractOgDescription - returns null when neither tag is present", () => {
  const html = `<html><head><title>No description here</title></head></html>`;
  assertEquals(extractOgDescription(html), null);
});

Deno.test("extractOgDescription - returns null when content is empty", () => {
  const html = `<meta property="og:description" content="">`;
  assertEquals(extractOgDescription(html), null);
});

Deno.test("extractOgDescription - decodes HTML entities in content", () => {
  const html =
    `<meta property="og:description" content="Fish &amp; chips &quot;done right&quot;">`;
  assertEquals(extractOgDescription(html), `Fish & chips "done right"`);
});
