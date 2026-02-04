import React, { useEffect, useState } from "react";
import { Box, Typography, IconButton, Stack, Button } from "@mui/material";

import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

import {
  Edit,
  Delete,
  Add,
  Favorite,
} from "@mui/icons-material";

import APIService from "./services/APIService";
import CategoryDialog, { type CategoryForm } from "./dialogs/CategoryDialog";
import TopicDialog, { type TopicForm } from "./dialogs/TopicDialog";
import PostDialog, { type PostForm } from "./dialogs/PostDialog";
import ReplyDialog, { type ReplyForm } from "./dialogs/ReplyDialog";
import PostLikeDialog, { type PostLikeForm } from "./dialogs/PostLikeDialog";


// ----------------------
// Types (API shape)
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

const API_BASE = "http://127.0.0.1:8000";
const API_CATEGORIES = API_BASE+"/api/categories/";
const API_TOPICS = API_BASE+"/api/topics/";
const API_POSTS = API_BASE+"/api/posts/";
const API_REPLIES = API_BASE+"/api/replies/";
const API_LIKES = API_BASE+"/api/likes/";

// ----------------------
// Main Component
// ----------------------
const NestedForumPage: React.FC = () => {
  const [Reply, setReply] = useState<Reply[]>([]);
  const [Like, setLike] = useState<Like[]>([]);
  const [Post, setPost] = useState<Post[]>([]);
  const [Topic, setTopic] = useState<Topic[]>([]);
  const [Category, setCategory] = useState<Category[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  // Dialog states
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [topicDialog, setTopicDialog] = useState(false);
  const [postDialog, setPostDialog] = useState(false);
  const [replyDialog, setReplyDialog] = useState(false);
  const [likeDialog, setLikeDialog] = useState(false);



  // Form states
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    name: "",
    description: "",
  });

  const [topicForm, setTopicForm] = useState<TopicForm>({
    title: "",
    description: "",
    category_id: "",
  });

  const [postForm, setPostForm] = useState<PostForm>({
    topic: "",
    content: "",
  });

  const [replyForm, setReplyForm] = useState<ReplyForm>({
    post: "",
    content: "",
  });

  const [likeForm, setLikeForm] = useState<PostLikeForm>({
    post: "",
  });


  /*const [saving, setSaving] = useState(false);*/

  // ----------------------
  // Helpers
  // ----------------------
 async function safeJson (res: Response) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

// 🔄 Load data
async function loadData<T>(url: string, setState: React.Dispatch<React.SetStateAction<T[]>>): Promise<void> {
  setLoading(true);
  try {
    const data = await APIService.loadData<T[]>(url);
    setState(data);
  } catch (err) {
    console.error("Load error:", err);
  } finally {
    setLoading(false);
  }
}

//loadData(API_CATEGORIES, setCategory);

// ➕ Create item
async function createItem  <T>(url: string, item: T, cType: React.Dispatch<React.SetStateAction<T[]>>): Promise<void> {
  setSaving(true);
  try {
    await APIService.createItem(url, item);
    await loadData(url, cType);
  } catch (err) {
    console.error("Create error:", err);
  } finally {
    setSaving(false);
  }
};

// ✏️ Update item
async function updateItem <T extends { id: number }>(url: string, item: T, uType: React.Dispatch<React.SetStateAction<T[]>>): Promise<void>  {
  setSaving(true);
  try {
    await APIService.updateItem(url, item);
    await loadData(url, uType);
  } catch (err) {
    console.error("Update error:", err);
  } finally {
    setSaving(false);
  }
};

// ❌ Delete item
async function  deleteItem <T>(url: string, id: number, dType: React.Dispatch<React.SetStateAction<T[]>>): Promise<void>  {
  if (!window.confirm("Are you sure you want to delete this item?")) return;
  try {
    await APIService.deleteItem(url, id);
    await loadData(url, dType);
  } catch (err) {
    console.error("Delete error:", err);
  }
};

  /*const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_CATEGORIES);
      if (!res.ok) {
        console.error("Failed to load categories", res.status);
        setData([]);
        return;
      }
      const json = await safeJson(res);
      setData(Array.isArray(json) ? (json as Category[]) : []);
    } catch (err) {
      console.error("Load error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const deleteItem = async (url: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) console.error("Delete failed", res.status);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      loadData();
    }
  };*/

  








  

  // ----------------------
  // Render helpers
  // ----------------------
  const renderReplies = (post: Post) =>
    (post.replies ?? []).map((reply) => (
      <TreeItem
        key={`reply-${reply.id}`}
        itemId={`reply-${reply.id}`}
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
              onClick={() => deleteItem(API_REPLIES,reply.id, setReply)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Stack>
        }
      />
    ));

  const renderLikes = (post: Post) =>
    (post.likes ?? []).map((like) => (
      <TreeItem
        key={`like-${like.id}`}
        itemId={`like-${like.id}`}
        label={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>❤️ {like.user_username}</Typography>

            <IconButton
              size="small"
              color="error"
              onClick={() => deleteItem(API_LIKES,like.id, setLike)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Stack>
        }
      />
    ));

  const renderPosts = (topic: Topic) =>
    (topic.posts ?? []).map((post) => (
      <TreeItem
        key={`post-${post.id}`}
        itemId={`post-${post.id}`}
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
              onClick={() => deleteItem(API_POSTS,post.id, setPost)}
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
        <TreeItem itemId={`post-${post.id}-replies`} label="Replies">
          {renderReplies(post)}
        </TreeItem>

        <TreeItem itemId={`post-${post.id}-likes`} label="Likes">
          {renderLikes(post)}
        </TreeItem>
      </TreeItem>
    ));

  const renderTopics = (category: Category) =>
    (category.topics ?? []).map((topic) => (
      <TreeItem
        key={`topic-${topic.id}`}
        itemId={`topic-${topic.id}`}
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
              onClick={() => deleteItem(API_TOPICS, topic.id, setTopic)}
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
        itemId={`cat-${cat.id}`}
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
              onClick={() => deleteItem(API_CATEGORIES, cat.id, setCategory)}
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
  // Dialog data lists
  // ----------------------
  const allTopics = data.flatMap((c) => c.topics ?? []);
  const allPostsForSelect = data.flatMap((c) =>
    (c.topics ?? []).flatMap((t) =>
      (t.posts ?? []).map((p) => ({ id: p.id, content: p.content }))
    )
  );
  const allPostsFull = data.flatMap((c) =>
    (c.topics ?? []).flatMap((t) => t.posts ?? [])
  );

  // ----------------------
  // Render
  // ----------------------
  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Forum</Typography>

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
          {renderCategories()}
        </SimpleTreeView>
      )}

      <CategoryDialog
        open={categoryDialog}
        form={categoryForm}
        onChange={(f, v) => setCategoryForm({ ...categoryForm, [f]: v })}
        onClose={() => setCategoryDialog(false)}
        onSave={async () => {
          setSaving(true);
          try {
            const url = categoryForm.id
              ? `${API_CATEGORIES}${categoryForm.id}/`
              : API_CATEGORIES;

            const res = await fetch(url, {
              method: categoryForm.id ? "PUT" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(categoryForm),
            });

            if (!res.ok) console.error("Category save failed", res.status);
          } finally {
            setSaving(false);
            setCategoryDialog(false);
            loadData(API_CATEGORIES, setCategory);
          }
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
          try {
            const url = topicForm.id ? `${API_TOPICS}${topicForm.id}/` : API_TOPICS;

            const res = await fetch(url, {
              method: topicForm.id ? "PUT" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(topicForm),
            });

            if (!res.ok) console.error("Topic save failed", res.status);
          } finally {
            setSaving(false);
            setTopicDialog(false);
            loadData(API_TOPICS, setTopic);
          }
        }}
        saving={saving}
      />

      <PostDialog
        open={postDialog}
        form={postForm}
        topics={allTopics}
        onChange={(f, v) => setPostForm({ ...postForm, [f]: v })}
        onClose={() => setPostDialog(false)}
        onSave={async () => {
          setSaving(true);
          try {
            const url = postForm.id ? `${API_POSTS}${postForm.id}/` : API_POSTS;

            const res = await fetch(url, {
              method: postForm.id ? "PUT" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(postForm),
            });

            if (!res.ok) console.error("Post save failed", res.status);
          } finally {
            setSaving(false);
            setPostDialog(false);
            loadData(API_POSTS, setPost);
          }
        }}
        saving={saving}
      />

      <ReplyDialog
        open={replyDialog}
        form={replyForm}
        posts={allPostsForSelect}
        onChange={(f, v) => setReplyForm({ ...replyForm, [f]: v })}
        onClose={() => setReplyDialog(false)}
        onSave={async () => {
          setSaving(true);
          try {
            const url = replyForm.id ? `${API_REPLIES}${replyForm.id}/` : API_REPLIES;

            const res = await fetch(url, {
              method: replyForm.id ? "PUT" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(replyForm),
            });

            if (!res.ok) console.error("Reply save failed", res.status);
          } finally {
            setSaving(false);
            setReplyDialog(false);
            loadData(API_REPLIES, setReply);
          }
        }}
        saving={saving}
      />

      <PostLikeDialog
        open={likeDialog}
        form={likeForm}
        posts={allPostsFull}
        onChange={(f, v) => setLikeForm({ ...likeForm, [f]: v })}
        onClose={() => setLikeDialog(false)}
        onSave={async () => {
          setSaving(true);
          try {
            const res = await fetch(API_LIKES, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(likeForm),
            });

            if (!res.ok) console.error("Like save failed", res.status);
          } finally {
            setSaving(false);
            setLikeDialog(false);
            loadData(API_LIKES, setLike);
          }
        }}
        saving={saving}
      />
    </Box>
  );
};

export default NestedForumPage;
