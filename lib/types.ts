export interface Article {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  created_by: string;
  upvotes_count: number;
  comments_count: number;
  score: number;
  description: string;
  url: string;
}
