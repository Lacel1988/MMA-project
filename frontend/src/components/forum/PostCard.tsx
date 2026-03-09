import LikeButton from "./LikeButton";
import UserAvatar from "./UserAvatar";

type Reply = {
  id: number;
  author_username: string;
  content: string;
  replied_at: string;
};

type Post = {
  id: number;
  author_username: string;
  content: string;
  posted_at: string;
  replies: Reply[];
  likes: { id: number }[];
};

type Props = {
  post: Post;
};

export default function PostCard({ post }: Props) {
  return (
    <div className="forum-post">

      <div className="post-header">

        <UserAvatar username={post.author_username} />

        <div>
          <div className="post-author">{post.author_username}</div>
          <div className="post-date">{post.posted_at}</div>
        </div>

      </div>

      <div className="post-content">{post.content}</div>

      <div className="post-actions">
        <LikeButton count={post.likes.length} />
      </div>

      <div className="reply-container">

        {post.replies.map((reply) => (
          <div key={reply.id} className="forum-post">

            <div className="post-header">

              <UserAvatar username={reply.author_username} />

              <div>
                <div className="post-author">{reply.author_username}</div>
                <div className="post-date">{reply.replied_at}</div>
              </div>

            </div>

            <div className="post-content">{reply.content}</div>

          </div>
        ))}

      </div>

    </div>
  );
}