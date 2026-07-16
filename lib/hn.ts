const HN_BASE = "https://hacker-news.firebaseio.com/v0";
const BATCH_SIZE = 20;

export interface HNStory {
  id: number;
  type: string;
  title: string;
  url?: string;
  by: string;
  score: number;
  descendants?: number;
  time: number;
  text?: string;
  kids?: number[];
}

export interface HNComment {
  id: number;
  by?: string;
  text?: string;
  kids?: number[];
  deleted?: boolean;
  dead?: boolean;
}

export async function fetchTopIds(): Promise<number[]> {
  const res = await fetch(`${HN_BASE}/topstories.json`);
  if (!res.ok) throw new Error(`HN API error ${res.status} fetching top IDs`);
  return res.json();
}

export async function fetchStory(id: number): Promise<HNStory | null> {
  const res = await fetch(`${HN_BASE}/item/${id}.json`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchTopStories(): Promise<HNStory[]> {
  const ids = await fetchTopIds();
  const stories: HNStory[] = [];

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(fetchStory));
    for (const story of results) {
      if (story !== null) stories.push(story);
    }
  }

  return stories;
}

export async function fetchComment(id: number): Promise<HNComment | null> {
  const res = await fetch(`${HN_BASE}/item/${id}.json`);
  if (!res.ok) return null;
  return res.json();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/")
    .replace(/&amp;/g, "&");
}

function htmlToText(html: string): string {
  const withBreaks = html
    .replace(/<p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n");
  const noTags = withBreaks.replace(/<[^>]+>/g, "");
  return decodeHtmlEntities(noTags).trim();
}

// HN's public API doesn't expose comment vote counts, so we approximate
// "most upvoted" using the comment with the most direct replies.
export async function fetchTopComment(
  kidIds: number[],
): Promise<{ id: number; author: string; content: string } | null> {
  const comments: HNComment[] = [];

  for (let i = 0; i < kidIds.length; i += BATCH_SIZE) {
    const batch = kidIds.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(fetchComment));
    for (const comment of results) {
      if (
        comment && !comment.deleted && !comment.dead && comment.text &&
        comment.by
      ) {
        comments.push(comment);
      }
    }
  }

  if (comments.length === 0) return null;

  const top = comments.reduce((best, c) =>
    (c.kids?.length ?? 0) > (best.kids?.length ?? 0) ? c : best
  );

  return { id: top.id, author: top.by!, content: htmlToText(top.text!) };
}
