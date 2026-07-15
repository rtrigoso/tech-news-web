import { type PageProps } from "$fresh/server.ts";
export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>hn-focus</title>
        <meta name="description" content="top articles focusing on computer science" />
        <meta name="keywords" content="articles, stories, programming, computer science, hackernews, aggregator" />
        <meta name="author" content="renfoc.us" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="alternate" type="application/rss+xml" title="HN Focus" href="/rss.xml" />
      </head>
      <body class="bg-secondary text-primary text-base">
        <Component />
      </body>
    </html>
  );
}
