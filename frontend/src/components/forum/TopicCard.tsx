import PostCard from "./PostCard";

type Post = any;

type Topic = {
  id: number;
  title: string;
  description: string | null;
  posts: Post[];
};

type Props = {
  topic: Topic;
};

export default function TopicCard({ topic }: Props) {
  return (
    <div className="forum-topic">

      <div className="forum-topic-title">
        {topic.title}
      </div>

      {topic.description && (
        <div>{topic.description}</div>
      )}

      {topic.posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

    </div>
  );
}