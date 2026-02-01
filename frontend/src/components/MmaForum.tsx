import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Button,
} from "@mui/material";

import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";

import {
  ExpandMore,
  ChevronRight,
  Edit,
  Delete,
  Add,
  Favorite,
} from "@mui/icons-material";



import CategoryDialog, { CategoryForm } from "./dialogs/CategoryDialog";
import TopicDialog, { TopicForm } from "./dialogs/TopicDialog";
import PostDialog, { PostForm } from "./dialogs/PostDialog";
import ReplyDialog, { ReplyForm } from "./dialogs/ReplyDialog";
import PostLikeDialog, { PostLikeForm } from "./dialogs/PostLikeDialog";
import PostLikeForm from "./dialogs/PostLikeDialog";



// ----------------------
// Types
// ----------------------
type Reply = {
  id: number;
  author_username: string;
  content: string;
  replied_at: string;
};

type Like = {
  id: number;
  user_username: string;
  liked_at: string;
};

type Post = {
  id: number;
  author_username: string;
  content: string;
  posted_at: string;
  replies: Reply[];
  likes: Like[];
};

type Topic = {
  id: number;
  title: string;
  description: string | null;
  posts: Post[];
};

type Category = {
  id: number;
  name: string;
  description: string | null;
  topics: Topic[];
};


// ----------------------
// API endpoints
// ----------------------
const API_CATEGORIES = "/api/categories/";
const API_TOPICS = "/api/topics/";
const API_POSTS = "/api/posts/";
const API_REPLIES = "/api/replies/";
const API_LIKES = "/api/likes/";


// ----------------------
// Main Component
// ----------------------
const NestedForumPage: React.FC = () => {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [topicDialog, setTopicDialog] = useState(false);
  const [postDialog, setPostDialog] = useState(false);
  const [replyDialog, setReplyDialog] = useState(false);
  const [likeDialog, setLikeDialog] = useState(false);

  // Form states
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({ name: "", description: "" });
  const [topicForm, setTopicForm] = useState<TopicForm>({ title: "", description: "", category_id: "" });
  const [postForm, setPostForm] = useState<PostForm>({ topic: "", content: "" });
  const [replyForm, setReplyForm] = useState<ReplyForm>({ post: "", content: "" });
  const [likeForm, setLikeForm] = useState<PostLikeForm>({ post: "" });

  const [saving, setSaving] = useState(false);


  // ----------------------
  // Load full nested tree
  // ----------------------
  const loadData = async () => {
    setLoading(true);
    const res = await fetch(API_CATEGORIES);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);


  // ----------------------
  // Delete helpers
  // ----------------------
  const deleteItem = async (url: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    await fetch(url, { method: "DELETE" });
    loadData();
  };


  // ----------------------
  // Render helpers
  // ----------------------
  const renderReplies = (post: Post) =>
    post.replies.map((reply) => (
      <TreeItem
        key={`reply-${reply.id}`}
        nodeId={`reply-${reply.id}`}
        label={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>
              💬 {reply.author_username}: {reply.content}
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                setReplyForm({
                  id: reply.id,
                  post: post.id,
                  content: reply.content,
                });
                setReplyDialog(true);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => deleteItem(`${API_REPLIES}${reply.id}/`)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Stack>
        }
      />
    ));


  const renderLikes = (post: Post) =>
    post.likes.map((like) => (
      <TreeItem
        key={`like-${like.id}`}
        nodeId={`like-${like.id}`}
        label={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>❤️ {like.user_username}</Typography>
            <IconButton
              size="small"
              color="error"
              onClick={() => deleteItem(`${API_LIKES}${like.id}/`)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Stack>
        }
      />
    ));


  const renderPosts = (topic: Topic) =>
    topic.posts.map((post) => (
      <TreeItem
        key={`post-${post.id}`}
        nodeId={`post-${post.id}`}
        label={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>
              📝 {post.author_username}: {post.content}
            </Typography>

            <IconButton
              size="small"
              onClick={() => {
                setPostForm({
                  id: post.id,
                  topic: topic.id,
                  content: post.content,
                });
                setPostDialog(true);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              color="error"
              onClick={() => deleteItem(`${API_POSTS}${post.id}/`)}
            >
              <Delete fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => {
                setReplyForm({ post: post.id, content: "" });
                setReplyDialog(true);
              }}
            >
              <Add fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => {
                setLikeForm({ post: post.id });
                setLikeDialog(true);
              }}
            >
              <Favorite fontSize="small" />
            </IconButton>
          </Stack>
        }
      >
        <TreeItem nodeId={`post-${post.id}-replies`} label="Replies">
          {renderReplies(post)}
        </TreeItem>

        <TreeItem nodeId={`post-${post.id}-likes`} label="Likes">
          {renderLikes(post)}
        </TreeItem>
      </TreeItem>
    ));


  const renderTopics = (category: Category) =>
    category.topics.map((topic) => (
      <TreeItem
        key={`topic-${topic.id}`}
        nodeId={`topic-${topic.id}`}
        label={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>📌 {topic.title}</Typography>

            <IconButton
              size="small"
              onClick={() => {
                setTopicForm({
                  id: topic.id,
                  title: topic.title,
                  description: topic.description ?? "",
                  category_id: category.id,
                });
                setTopicDialog(true);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              color="error"
              onClick={() => deleteItem(`${API_TOPICS}${topic.id}/`)}
            >
              <Delete fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => {
                setPostForm({ topic: topic.id, content: "" });
                setPostDialog(true);
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Stack>
        }
      >
        {renderPosts(topic)}
      </TreeItem>
    ));


  const renderCategories = () =>
    data.map((cat) => (
      <TreeItem
        key={`cat-${cat.id}`}
        nodeId={`cat-${cat.id}`}
        label={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">📁 {cat.name}</Typography>

            <IconButton
              size="small"
              onClick={() => {
                setCategoryForm({
                  id: cat.id,
                  name: cat.name,
                  description: cat.description ?? "",
                });
                setCategoryDialog(true);
              }}
            >
              <Edit />
            </IconButton>

            <IconButton
              size="small"
              color="error"
              onClick={() => deleteItem(`${API_CATEGORIES}${cat.id}/`)}
            >
              <Delete />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => {
                setTopicForm({ title: "", description: "", category_id: cat.id });
                setTopicDialog(true);
              }}
            >
              <Add />
            </IconButton>
          </Stack>
        }
      >
        {renderTopics(cat)}
      </TreeItem>
    ));


  // ----------------------
  // Render
  // ----------------------
  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Forum Structure</Typography>

        <Button
          variant="contained"
          onClick={() => {
            setCategoryForm({ name: "", description: "" });
            setCategoryDialog(true);
          }}
        >
          Add Category
        </Button>
      </Stack>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <SimpleTreeView>
          defaultCollapseIcon={<ExpandMore />}
          defaultExpandIcon={<ChevronRight />}
          {renderCategories()}
        </SimpleTreeView>
      )}

      {/* Dialogs */}
      <CategoryDialog
        open={categoryDialog}
        form={categoryForm}
        onChange={(f, v) => setCategoryForm({ ...categoryForm, [f]: v })}
        onClose={() => setCategoryDialog(false)}
        onSave={async () => {
          setSaving(true);
          const url = categoryForm.id
            ? `${API_CATEGORIES}${categoryForm.id}/`
            : API_CATEGORIES;

          await fetch(url, {
            method: categoryForm.id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(categoryForm),
          });

          setSaving(false);
          setCategoryDialog(false);
          loadData();
        }}
        saving={saving}
      />

      <TopicDialog
        open={topicDialog}
        form={topicForm}
        categories={data}
        onChange={(f, v) => setTopicForm({ ...topicForm, [f]: v })}
        onClose={() => setTopicDialog(false)}
        onSave={async () => {
          setSaving(true);
          const url = topicForm.id
            ? `${API_TOPICS}${topicForm.id}/`
            : API_TOPICS;

          await fetch(url, {
            method: topicForm.id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(topicForm),
          });

          setSaving(false);
          setTopicDialog(false);
          loadData();
        }}
        saving={saving}
      />

      <PostDialog
        open={postDialog}
        form={postForm}
        topics={data.flatMap((c) => c.topics)}
        onChange={(f, v) => setPostForm({ ...postForm, [f]: v })}
        onClose={() => setPostDialog(false)}
        onSave={async () => {
          setSaving(true);
          const url = postForm.id
            ? `${API_POSTS}${postForm.id}/`
            : API_POSTS;

          await fetch(url, {
            method: postForm.id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postForm),
          });

          setSaving(false);
          setPostDialog(false);
          loadData();
        }}
        saving={saving}
      />

      <ReplyDialog
        open={replyDialog}
        form={replyForm}
        posts={data.flatMap((c) => c.topics.flatMap((t) => t.posts))}
        onChange={(f, v) => setReplyForm({ ...replyForm, [f]: v })}
        onClose={() => setReplyDialog(false)}
        onSave={async () => {
          setSaving(true);
          const url = replyForm.id
            ? `${API_REPLIES}${replyForm.id}/`
            : API_REPLIES;

          await fetch(url, {
            method: replyForm.id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(replyForm),
          });

          setSaving(false);
          setReplyDialog(false);
          loadData();
        }}
        saving={saving}
      />

      <PostLikeDialog
        open={likeDialog}
        form={likeForm}
        posts={data.flatMap((c) => c.topics.flatMap((t) => t.posts))}
        onChange={(f, v) => setLikeForm({ ...likeForm, [f]: v })}
        onClose={() => setLikeDialog(false)}
        onSave={async () => {
          setSaving(true);

          await fetch(API_LIKES, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(likeForm),
          });

          setSaving(false);
          setLikeDialog(false);
          loadData();
        }}
        saving={saving}
      />
    </Box>
  );
};

export default NestedForumPage;