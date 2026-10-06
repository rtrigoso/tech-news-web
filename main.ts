/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";
import { backfillDescriptions, ingestTopStories } from "./lib/ingest.ts";

Deno.cron("ingest HN top stories", "0 * * * *", ingestTopStories);
Deno.cron(
  "backfill article descriptions",
  "*/10 * * * *",
  backfillDescriptions,
);

await start(manifest, config);
