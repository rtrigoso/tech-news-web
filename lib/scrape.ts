import { decodeHtmlEntities } from "./hn.ts";

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_BYTES = 65536;

export interface FetchOgDescriptionOptions {
  timeoutMs?: number;
  maxBytes?: number;
}

export function extractOgDescription(html: string): string | null {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];

  const readAttr = (tag: string, name: string): string | undefined =>
    tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1];

  for (const tag of metaTags) {
    const property = readAttr(tag, "property");
    const content = readAttr(tag, "content");
    if (property?.toLowerCase() === "og:description" && content) {
      const decoded = decodeHtmlEntities(content).trim();
      if (decoded) return decoded;
    }
  }

  for (const tag of metaTags) {
    const name = readAttr(tag, "name");
    const content = readAttr(tag, "content");
    if (name?.toLowerCase() === "description" && content) {
      const decoded = decodeHtmlEntities(content).trim();
      if (decoded) return decoded;
    }
  }

  return null;
}

export async function fetchOgDescription(
  url: string,
  opts: FetchOgDescriptionOptions = {},
): Promise<string | null> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;
    try {
      res = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      await res.body?.cancel().catch(() => {});
      return null;
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      await res.body?.cancel().catch(() => {});
      return null;
    }

    const reader = res.body?.getReader();
    if (!reader) return null;

    const decoder = new TextDecoder();
    let html = "";
    let bytesRead = 0;

    try {
      while (bytesRead < maxBytes) {
        const { done, value } = await reader.read();
        if (done) break;
        bytesRead += value.byteLength;
        html += decoder.decode(value, { stream: true });
        if (/<\/head>/i.test(html)) break;
      }
    } finally {
      await reader.cancel().catch(() => {});
    }

    return extractOgDescription(html);
  } catch {
    return null;
  }
}
