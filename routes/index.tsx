import { getTopArticles } from "../lib/kv.ts";

export default async function Home() {
  const articles = await getTopArticles();

  return (
    <div class="px-4 py-8 mx-auto font-mono uppercase font-stretch-condensed">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <header class="mb-8 text-center">
          <h1 class="text-4xl font-bold">HN Focus</h1>
          <h2>top articles focusing on computer science</h2>
        </header>
        <main class="flex flex-col gap-4">
          {articles.map(
            ({ title, url, created_at, comments_count, upvotes_count, id }) => {
              const createdAt = new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }).format(new Date(created_at));

              return (
                <div class="text-sm">
                  <a
                    class="font-medium cursor-pointer blink decoration-primary underline decoration-dotted decoration-1 hover:text-tertiary hover:no-underline visited:text-primary visited:no-underline"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {title}
                  </a>
                  <div class="text-xs flex flex-row justify-between gap-4 pt-0.5">
                    <div>{createdAt}</div>
                    <a
                      class="flex flex-row text-white gap-2"
                      href={`https://news.ycombinator.com/item?id=${id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div class="flex flex-row gap-0.5">
                        <img src="/comments.svg" height={12} width={12} />
                        <span>{comments_count}</span>
                      </div>
                      <div class="flex flex-row gap-0.5">
                        <img src="/upvote.svg" height={12} width={12} />
                        <span>{upvotes_count}</span>
                      </div>
                    </a>
                  </div>
                </div>
              );
            },
          )}
        </main>
        <footer class="pt-12 flex flex-col items-center gap-3">
          <p>
            This site pulls posts in hackernews and sorts them using the
            lower-bound of a{" "}
            <a
              class="text-pink-400"
              href="https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wilson score confidence interval
            </a>
          </p>
          <a href="/rss.xml" title="RSS Feed" class="text-primary hover:text-pink-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 11a9 9 0 0 1 9 9" />
              <path d="M4 4a16 16 0 0 1 16 16" />
              <circle cx="5" cy="19" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </footer>
      </div>
    </div>
  );
}
