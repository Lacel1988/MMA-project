export type UiReply = {
  id: number;
  author_username: string;
  content: string;
  replied_at: string;
};

export type UiLike = {
  id: number;
  user_username: string;
  liked_at: string;
};

export type UiPost = {
  id: number;
  author_username: string;
  content: string;
  posted_at: string;
  topicId?: number;
  replies: UiReply[];
  likes: UiLike[];
};

export type UiTopic = {
  id: number;
  title: string;
  description: string | null;
  category_id: number;
  created_by_username?: string;
  created_at?: string;
  posts: UiPost[];
};

export type UiCategory = {
  id: number;
  name: string;
  description: string | null;
  topics: UiTopic[];
};