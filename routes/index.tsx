import { getTopArticles } from "../lib/kv.ts";

export default async function Home() {
  const articles = await getTopArticles(50);

  const oldestDay = new Date(
    articles.reduce(
      (min, { created_at }) =>
        new Date(created_at) < new Date(min) ? created_at : min,
      articles[0]?.created_at ?? "",
    ),
  ).toDateString();

  return (
    <div class="px-4 py-8 mx-auto font-mono uppercase font-stretch-condensed">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <header class="mb-8 text-center">
          <h1 class="text-4xl font-bold">HN Focus</h1>
          <h2>top articles focusing on computer science</h2>
          <div class="flex items-center justify-center gap-4 mt-2 text-xs">
            <div class="flex items-center gap-1.5">
              <span class="inline-block w-[1em] h-[1em] border border-tertiary">
              </span>
              <span class="leading-none lowercase">new</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="inline-block w-[1em] h-[1em] border border-accent">
              </span>
              <span class="leading-none lowercase">buzzing</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="inline-block w-[1em] h-[1em] border border-hyped">
              </span>
              <span class="leading-none lowercase">hyped</span>
            </div>
          </div>
        </header>
        <main class="flex flex-col gap-4">
          {articles.map(
            (
              {
                title,
                url,
                created_at,
                comments_count,
                upvotes_count,
                id,
                top_comment,
              },
            ) => {
              const createdAt = new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }).format(new Date(created_at));

              const isToday = new Date(created_at).toDateString() ===
                new Date().toDateString();
              const isBuzzing = !isToday &&
                new Date(created_at).toDateString() === oldestDay;
              const ratio = comments_count > 0
                ? upvotes_count / comments_count
                : Infinity;
              const isHyped = !isToday && !isBuzzing && comments_count >= 50 &&
                Math.floor(ratio) >= 1 && Math.floor(ratio) <= 9;
              const textColor = isToday
                ? "text-tertiary hover:text-tertiary"
                : isBuzzing
                ? "text-accent hover:text-accent"
                : isHyped
                ? "text-hyped hover:text-hyped"
                : "hover:text-white";

              return (
                <div
                  class={`text-sm p-[var(--item-padding)] border border-secondary hover:bg-black/20 hover:cursor-pointer${
                    isToday ? " article-today" : ""
                  }${isBuzzing ? " article-buzzing" : ""}${
                    isHyped ? " article-hyped" : ""
                  }`}
                >
                  <a
                    class={`font-medium cursor-pointer blink decoration-primary no-underline ${textColor} visited:text-primary visited:no-underline`}
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
                  {top_comment && (
                    <a
                      href={`https://news.ycombinator.com/item?id=${top_comment.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View comment by ${top_comment.author} on Hacker News: "${top_comment.content}"`}
                      class="block text-[0.75rem] normal-case text-primary/60 italic mt-1 line-clamp-2 py-4 px-16 hover:text-primary/80"
                    >
                      &ldquo;{top_comment.content}&rdquo; &mdash;{" "}
                      {top_comment.author}
                    </a>
                  )}
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
          <a
            href="/rss.xml"
            title="RSS Feed"
            class="text-primary hover:text-pink-400"
          >
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
