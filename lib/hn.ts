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
