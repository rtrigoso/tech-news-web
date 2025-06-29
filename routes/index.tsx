import { createClient } from "https://esm.sh/@supabase/supabase-js@2.2.3?target=es2022";
import "jsr:@std/dotenv/load";

interface Article {
  id: number,
  created_at: string
  updated_at: string
  title: string
  created_by: string
  upvotes_count: number
  comments_count: number
  score: number
  description: string
  url: string
}

async function GetArticles (): Promise<Article[]> {
  const SUPABASE_PROJECT_URL = Deno.env.get('SUPABASE_PROJECT_URL') || '';
  const SUPABASE_PUBLIC_KEY = Deno.env.get('SUPABASE_PUBLIC_KEY') || '';

  const supabase = createClient(
    SUPABASE_PROJECT_URL,
    SUPABASE_PUBLIC_KEY,
  );

  const resources = await supabase
    .from("Posts")
    .select()
    .order('score', { ascending: false })
    .limit(20);

  if (resources.error) {
    console.error(resources.error);
  }
  
  return resources.data as Article[];
}

export default async function Home() {
  const articles = await GetArticles();

  return (
    <div class="px-4 py-8 mx-auto font-mono uppercase font-stretch-condensed">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <header class="mb-8 text-center">
          <h1 class="text-4xl font-bold">HN renfoc.us</h1>
          <h2>top articles focusing on computer science</h2>
        </header>
        <main class="flex flex-col gap-4">
        { 
          articles.map(({ title, url, created_at, comments_count, upvotes_count, id }) => {
            const createdAt = new Intl.DateTimeFormat(
              'en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
              }
            ).format(new Date(created_at));

            return (
              <div class="text-sm">
                <a class="font-medium cursor-pointer blink decoration-primary underline decoration-dotted decoration-1 hover:text-tertiary hover:no-underline visited:text-primary visited:no-underline" href={url} target="_BLANK" >{title}</a>
                <div class="text-xs flex flex-row justify-between gap-4 pt-0.5">
                  <div>{ createdAt }</div>
                  <a class="flex flex-row text-white gap-2" href={`https://news.ycombinator.com/item?id=${id}`}>
                    <div class="flex flex-row gap-0.5" >
                      <img src="/comments.svg" height={12} width={12} />
                      <span>{comments_count}</span>
                    </div>
                    <div class="flex flex-row gap-0.5">
                      <img src="/upvote.svg" height={12} width={12}/>
                      <span>{upvotes_count}</span>
                    </div>
                  </a>
                </div>
              </div>
            );
          })
        }
        </main>
        <footer class="pt-12">
          This site pulls posts in hackernews and sorts them using the lower-bound of a <a class="text-pink-400" href="https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval" target="_BLANK">Wilson score confidence interval</a>
        </footer>
      </div>
    </div>
  );
}
