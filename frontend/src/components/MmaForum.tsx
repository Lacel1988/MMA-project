import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  ThumbUpAlt,
  Forum,
  LocalFireDepartment,
  SubdirectoryArrowRight,
  Send,
} from "@mui/icons-material";

import CategoryDialog, { type CategoryForm } from "./dialogs/CategoryDialog";
import TopicDialog, { type TopicForm } from "./dialogs/TopicDialog";

import {
  listCategories,
  listTopics,
  getTopic,
  getPost,
  createCategory,
  updateCategory,
  deleteCategory,
  createTopic,
  updateTopic,
  deleteTopic,
  createPost,
  deletePost,
  createReply,
  deleteReply,
  likePost,
  unlikePost,
} from "../api/forumApi";

// --------------------------------------------------
// Local UI types
// --------------------------------------------------
type UiReply = {
  id: number;
  author_username: string;
  content: string;
  replied_at: string;
};

type UiLike = {
  id: number;
  user_username: string;
  liked_at: string;
};

type UiPost = {
  id: number;
  author_username: string;
  content: string;
  posted_at: string;
  topicId?: number;
  replies: UiReply[];
  likes: UiLike[];
};

type UiTopic = {
  id: number;
  title: string;
  description: string | null;
  category_id: number;
  created_by_username?: string;
  created_at?: string;
  posts: UiPost[];
};

type UiCategory = {
  id: number;
  name: string;
  description: string | null;
  topics: UiTopic[];
};

// --------------------------------------------------
// Helpers
// --------------------------------------------------
function normalizeReply(raw: any): UiReply {
  return {
    id: Number(raw?.id ?? 0),
    author_username: String(raw?.author_username ?? "unknown"),
    content: String(raw?.content ?? ""),
    replied_at: String(raw?.replied_at ?? ""),
  };
}

function normalizeLike(raw: any): UiLike {
  return {
    id: Number(raw?.id ?? 0),
    user_username: String(raw?.user_username ?? "unknown"),
    liked_at: String(raw?.liked_at ?? ""),
  };
}

function normalizePost(raw: any, fallbackTopicId?: number): UiPost {
  return {
    id: Number(raw?.id ?? 0),
    author_username: String(raw?.author_username ?? "unknown"),
    content: String(raw?.content ?? ""),
    posted_at: String(raw?.posted_at ?? ""),
    topicId:
      typeof raw?.topic === "number"
        ? raw.topic
        : typeof raw?.topic_id === "number"
        ? raw.topic_id
        : fallbackTopicId,
    replies: Array.isArray(raw?.replies) ? raw.replies.map(normalizeReply) : [],
    likes: Array.isArray(raw?.likes) ? raw.likes.map(normalizeLike) : [],
  };
}

function normalizeTopic(raw: any): UiTopic {
  const categoryId =
    typeof raw?.category_id === "number"
      ? raw.category_id
      : typeof raw?.category?.id === "number"
      ? raw.category.id
      : typeof raw?.category === "number"
      ? raw.category
      : 0;

  return {
    id: Number(raw?.id ?? 0),
    title: String(raw?.title ?? ""),
    description: raw?.description ?? null,
    category_id: categoryId,
    created_by_username: raw?.created_by_username
      ? String(raw.created_by_username)
      : undefined,
    created_at: raw?.created_at ? String(raw.created_at) : undefined,
    posts: Array.isArray(raw?.posts)
      ? raw.posts.map((p: any) => normalizePost(p, Number(raw?.id ?? 0)))
      : [],
  };
}

function normalizeCategory(raw: any): UiCategory {
  return {
    id: Number(raw?.id ?? 0),
    name: String(raw?.name ?? ""),
    description: raw?.description ?? null,
    topics: Array.isArray(raw?.topics) ? raw.topics.map(normalizeTopic) : [],
  };
}

function formatDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("hu-HU");
}

function userInitial(name: string): string {
  return (name?.trim()?.charAt(0) || "?").toUpperCase();
}

function roleLabel(name?: string): string {
  if (!name) return "";
  return name === "admin" ? "superuser" : "staff";
}

// --------------------------------------------------
// Component
// --------------------------------------------------
export default function MmaForum() {
  const [categories, setCategories] = useState<UiCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [categoryDialog, setCategoryDialog] = useState(false);
  const [topicDialog, setTopicDialog] = useState(false);

  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    name: "",
    description: "",
  });

  const [topicForm, setTopicForm] = useState<TopicForm>({
    title: "",
    description: "",
    category_id: "",
  });

  const [ujPostSzovegek, setUjPostSzovegek] = useState<Record<number, string>>({});
  const [ujReplySzovegek, setUjReplySzovegek] = useState<Record<number, string>>({});
  const [likeBetoltes, setLikeBetoltes] = useState<Record<number, boolean>>({});
  const [postKuldesBetoltes, setPostKuldesBetoltes] = useState<Record<number, boolean>>({});
  const [replyKuldesBetoltes, setReplyKuldesBetoltes] = useState<Record<number, boolean>>({});

  async function refreshForumTree(): Promise<void> {
    setLoading(true);
    setErrorText("");

    try {
      const rawCategories = await listCategories();
      const baseCategories = rawCategories.map((item) => normalizeCategory(item));

      const rawTopics = await listTopics();

      const detailedTopics = await Promise.all(
        rawTopics.map(async (topic) => {
          try {
            const detailed = await getTopic(topic.id);
            return normalizeTopic(detailed);
          } catch {
            return normalizeTopic(topic);
          }
        })
      );

      const topicsWithDetailedPosts = await Promise.all(
        detailedTopics.map(async (topic) => {
          const posts = await Promise.all(
            (topic.posts ?? []).map(async (post) => {
              try {
                const detailedPost = await getPost(post.id);
                return normalizePost(detailedPost, topic.id);
              } catch {
                return normalizePost(post, topic.id);
              }
            })
          );

          return {
            ...topic,
            posts,
          };
        })
      );

      const categoryMap = new Map<number, UiCategory>();

      for (const category of baseCategories) {
        categoryMap.set(category.id, {
          ...category,
          topics: [],
        });
      }

      for (const topic of topicsWithDetailedPosts) {
        const existingCategory = categoryMap.get(topic.category_id);

        if (existingCategory) {
          existingCategory.topics.push(topic);
        } else {
          categoryMap.set(topic.category_id, {
            id: topic.category_id,
            name: `Category #${topic.category_id}`,
            description: null,
            topics: [topic],
          });
        }
      }

      setCategories(Array.from(categoryMap.values()));
    } catch (err: any) {
      console.error("Forum load error:", err);
      setCategories([]);
      setErrorText(err?.message || "Failed to load forum data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshForumTree();
  }, []);

  async function handleDeleteCategory(id: number): Promise<void> {
    if (!window.confirm("Biztosan törlöd ezt a kategóriát?")) return;

    try {
      await deleteCategory(id);
      await refreshForumTree();
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || "Category delete failed.");
    }
  }

  async function handleDeleteTopic(id: number): Promise<void> {
    if (!window.confirm("Biztosan törlöd ezt a topicot?")) return;

    try {
      await deleteTopic(id);
      await refreshForumTree();
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || "Topic delete failed.");
    }
  }

  async function handleDeletePost(id: number): Promise<void> {
    if (!window.confirm("Biztosan törlöd ezt a hozzászólást?")) return;

    try {
      await deletePost(id);
      await refreshForumTree();
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || "Post delete failed.");
    }
  }

  async function handleDeleteReply(id: number): Promise<void> {
    if (!window.confirm("Biztosan törlöd ezt a választ?")) return;

    try {
      await deleteReply(id);
      await refreshForumTree();
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || "Reply delete failed.");
    }
  }

  async function handleUnlike(id: number): Promise<void> {
    if (!window.confirm("Biztosan törlöd ezt a like-ot?")) return;

    try {
      await unlikePost(id);
      await refreshForumTree();
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || "Unlike failed.");
    }
  }

  async function handleLike(postId: number): Promise<void> {
    setErrorText("");
    setLikeBetoltes((elozo) => ({ ...elozo, [postId]: true }));

    try {
      await likePost(postId);
      await refreshForumTree();
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || "Like failed.");
    } finally {
      setLikeBetoltes((elozo) => ({ ...elozo, [postId]: false }));
    }
  }

  async function handleUjPost(topicId: number): Promise<void> {
    const szoveg = (ujPostSzovegek[topicId] ?? "").trim();

    if (!szoveg) {
      setErrorText("A hozzászólás nem lehet üres.");
      return;
    }

    setErrorText("");
    setPostKuldesBetoltes((elozo) => ({ ...elozo, [topicId]: true }));

    try {
      await createPost({
        topic_id: topicId,
        content: szoveg,
      });

      setUjPostSzovegek((elozo) => ({ ...elozo, [topicId]: "" }));
      await refreshForumTree();
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || "Post save failed.");
    } finally {
      setPostKuldesBetoltes((elozo) => ({ ...elozo, [topicId]: false }));
    }
  }

  async function handleUjReply(postId: number): Promise<void> {
    const szoveg = (ujReplySzovegek[postId] ?? "").trim();

    if (!szoveg) {
      setErrorText("A reply nem lehet üres.");
      return;
    }

    setErrorText("");
    setReplyKuldesBetoltes((elozo) => ({ ...elozo, [postId]: true }));

    try {
      await createReply({
        post_id: postId,
        content: szoveg,
      });

      setUjReplySzovegek((elozo) => ({ ...elozo, [postId]: "" }));
      await refreshForumTree();
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || "Reply save failed.");
    } finally {
      setReplyKuldesBetoltes((elozo) => ({ ...elozo, [postId]: false }));
    }
  }

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: 3,
        minHeight: "100%",
        background:
          "linear-gradient(180deg, rgba(8,8,8,0.96) 0%, rgba(16,16,16,0.98) 100%)",
        color: "#fff",
      }}
    >
      <Box sx={{ maxWidth: 1280, mx: "auto" }}>
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            background:
              "linear-gradient(135deg, rgba(20,20,20,0.98) 0%, rgba(10,10,10,0.98) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 28, md: 36 },
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                }}
              >
                MMA Forum
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  color: "rgba(255,255,255,0.72)",
                  fontSize: 14,
                }}
              >
                UFC stílusú beszélgetések, témák, reakciók és like-ok.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setCategoryForm({ name: "", description: "" });
                setCategoryDialog(true);
              }}
              sx={{
                backgroundColor: "#c40000",
                color: "#fff",
                fontWeight: 700,
                px: 2.5,
                "&:hover": {
                  backgroundColor: "#970000",
                },
              }}
            >
              Add Category
            </Button>
          </Stack>
        </Paper>

        {errorText && (
          <Paper
            elevation={0}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 2,
              background: "rgba(196, 0, 0, 0.12)",
              border: "1px solid rgba(255, 0, 0, 0.25)",
            }}
          >
            <Typography sx={{ color: "#ff8a8a", fontWeight: 600 }}>
              {errorText}
            </Typography>
          </Paper>
        )}

        {loading ? (
          <Typography sx={{ color: "rgba(255,255,255,0.8)" }}>
            Loading forum...
          </Typography>
        ) : categories.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: "rgba(20,20,20,0.96)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Typography sx={{ color: "rgba(255,255,255,0.78)" }}>
              Nincs még megjeleníthető fórumadat.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {categories.map((category) => (
              <Paper
                key={category.id}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  background:
                    "linear-gradient(180deg, rgba(22,22,22,0.98) 0%, rgba(14,14,14,0.98) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Box
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    borderLeft: "5px solid #c40000",
                    background:
                      "linear-gradient(90deg, rgba(196,0,0,0.14) 0%, rgba(196,0,0,0.03) 45%, rgba(0,0,0,0) 100%)",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={1.5}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Forum sx={{ color: "#c40000" }} />
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 24,
                            fontWeight: 800,
                            color: "#fff",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {category.name}
                        </Typography>

                        {category.description && (
                          <Typography
                            sx={{
                              mt: 0.5,
                              color: "rgba(255,255,255,0.72)",
                              fontSize: 14,
                            }}
                          >
                            {category.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={`${category.topics.length} topic`}
                        size="small"
                        sx={{
                          color: "#fff",
                          backgroundColor: "rgba(255,255,255,0.08)",
                        }}
                      />

                      <Button
                        size="small"
                        startIcon={<Add />}
                        onClick={() => {
                          setTopicForm({
                            title: "",
                            description: "",
                            category_id: category.id,
                          } as TopicForm);
                          setTopicDialog(true);
                        }}
                        sx={{
                          color: "#fff",
                          borderColor: "rgba(255,255,255,0.16)",
                        }}
                        variant="outlined"
                      >
                        Add Topic
                      </Button>

                      <IconButton
                        size="small"
                        onClick={() => {
                          setCategoryForm({
                            id: category.id,
                            name: category.name,
                            description: category.description ?? "",
                          } as CategoryForm);
                          setCategoryDialog(true);
                        }}
                        sx={{ color: "#fff" }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => handleDeleteCategory(category.id)}
                        sx={{ color: "#ff6b6b" }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>

                <Box sx={{ p: 2 }}>
                  {category.topics.length === 0 ? (
                    <Typography sx={{ color: "rgba(255,255,255,0.62)" }}>
                      Ebben a kategóriában még nincs topic.
                    </Typography>
                  ) : (
                    <Stack spacing={2}>
                      {category.topics.map((topic) => (
                        <Paper
                          key={topic.id}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            spacing={1.5}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                              >
                                <LocalFireDepartment
                                  sx={{ color: "#c40000", fontSize: 20 }}
                                />
                                <Typography
                                  sx={{
                                    fontSize: 21,
                                    fontWeight: 800,
                                    color: "#fff",
                                  }}
                                >
                                  {topic.title}
                                </Typography>
                              </Stack>

                              {topic.description && (
                                <Typography
                                  sx={{
                                    mt: 0.8,
                                    color: "rgba(255,255,255,0.74)",
                                    fontSize: 14,
                                  }}
                                >
                                  {topic.description}
                                </Typography>
                              )}

                              {(topic.created_by_username || topic.created_at) && (
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                  flexWrap="wrap"
                                  sx={{ mt: 1 }}
                                >
                                  {topic.created_by_username && (
                                    <Chip
                                      label={`By ${topic.created_by_username} (${roleLabel(
                                        topic.created_by_username
                                      )})`}
                                      size="small"
                                      sx={{
                                        color: "#fff",
                                        backgroundColor: "rgba(255,255,255,0.07)",
                                      }}
                                    />
                                  )}

                                  {topic.created_at && (
                                    <Typography
                                      sx={{
                                        color: "rgba(255,255,255,0.50)",
                                        fontSize: 12,
                                      }}
                                    >
                                      {formatDate(topic.created_at)}
                                    </Typography>
                                  )}
                                </Stack>
                              )}
                            </Box>

                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                              alignItems="flex-start"
                            >
                              <Chip
                                label={`${topic.posts.length} post`}
                                size="small"
                                sx={{
                                  color: "#fff",
                                  backgroundColor: "rgba(196,0,0,0.16)",
                                }}
                              />

                              <IconButton
                                size="small"
                                onClick={() => {
                                  setTopicForm({
                                    id: topic.id,
                                    title: topic.title,
                                    description: topic.description ?? "",
                                    category_id: category.id,
                                  } as TopicForm);
                                  setTopicDialog(true);
                                }}
                                sx={{ color: "#fff" }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>

                              <IconButton
                                size="small"
                                onClick={() => handleDeleteTopic(topic.id)}
                                sx={{ color: "#ff6b6b" }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>

                          <Divider
                            sx={{
                              my: 2,
                              borderColor: "rgba(255,255,255,0.08)",
                            }}
                          />

                          <Typography
                            sx={{
                              mb: 1.5,
                              color: "rgba(255,255,255,0.60)",
                              fontSize: 12,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              fontWeight: 700,
                            }}
                          >
                            Hozzászólások
                          </Typography>

                          <Paper
                            elevation={0}
                            sx={{
                              mb: 2,
                              ml: { xs: 0, md: 2 },
                              p: 2,
                              borderRadius: 2,
                              background:
                                "linear-gradient(180deg, rgba(30,30,30,0.98) 0%, rgba(22,22,22,0.98) 100%)",
                              border: "1px solid rgba(255,255,255,0.06)",
                              borderLeft: "3px solid rgba(196,0,0,0.35)",
                            }}
                          >
                            <Typography
                              sx={{
                                mb: 1.2,
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 14,
                              }}
                            >
                              Szólj hozzá ehhez a topichoz
                            </Typography>

                            <TextField
                              fullWidth
                              multiline
                              minRows={3}
                              placeholder="Írd le a véleményed..."
                              value={ujPostSzovegek[topic.id] ?? ""}
                              onChange={(e) =>
                                setUjPostSzovegek((elozo) => ({
                                  ...elozo,
                                  [topic.id]: e.target.value,
                                }))
                              }
                              sx={{
                                mb: 1.5,
                                "& .MuiOutlinedInput-root": {
                                  color: "#fff",
                                  backgroundColor: "rgba(255,255,255,0.02)",
                                  "& fieldset": {
                                    borderColor: "rgba(255,255,255,0.14)",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: "rgba(255,255,255,0.24)",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "#c40000",
                                  },
                                },
                                "& .MuiInputBase-input::placeholder": {
                                  color: "rgba(255,255,255,0.45)",
                                  opacity: 1,
                                },
                              }}
                            />

                            <Button
                              variant="contained"
                              startIcon={<Send />}
                              onClick={() => handleUjPost(topic.id)}
                              disabled={!!postKuldesBetoltes[topic.id]}
                              sx={{
                                backgroundColor: "#c40000",
                                color: "#fff",
                                fontWeight: 700,
                                "&:hover": {
                                  backgroundColor: "#970000",
                                },
                              }}
                            >
                              {postKuldesBetoltes[topic.id]
                                ? "Küldés..."
                                : "Hozzászólás küldése"}
                            </Button>
                          </Paper>

                          {topic.posts.length === 0 ? (
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                background: "rgba(255,255,255,0.02)",
                                border: "1px dashed rgba(255,255,255,0.12)",
                              }}
                            >
                              <Typography sx={{ color: "rgba(255,255,255,0.56)" }}>
                                Még nincs hozzászólás ehhez a topichoz.
                              </Typography>
                            </Paper>
                          ) : (
                            <Stack spacing={1.6}>
                              {topic.posts.map((post) => (
                                <Paper
                                  key={post.id}
                                  elevation={0}
                                  sx={{
                                    ml: { xs: 0, md: 2 },
                                    p: 2,
                                    borderRadius: 2,
                                    background:
                                      "linear-gradient(180deg, rgba(28,28,28,0.98) 0%, rgba(20,20,20,0.98) 100%)",
                                    border: "1px solid rgba(255,255,255,0.05)",
                                    borderLeft: "3px solid rgba(255,255,255,0.08)",
                                  }}
                                >
                                  <Stack spacing={1.5}>
                                    <Stack
                                      direction="row"
                                      justifyContent="space-between"
                                      alignItems="flex-start"
                                      spacing={1.5}
                                    >
                                      <Stack
                                        direction="row"
                                        spacing={1.2}
                                        alignItems="center"
                                      >
                                        <Avatar
                                          sx={{
                                            width: 38,
                                            height: 38,
                                            bgcolor: "#2e2e2e",
                                            color: "#fff",
                                            fontWeight: 700,
                                          }}
                                        >
                                          {userInitial(post.author_username)}
                                        </Avatar>

                                        <Box>
                                          <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            flexWrap="wrap"
                                          >
                                            <Typography
                                              sx={{
                                                fontWeight: 700,
                                                color: "#fff",
                                                fontSize: 14,
                                              }}
                                            >
                                              {post.author_username}
                                            </Typography>

                                            <Chip
                                              label={roleLabel(post.author_username)}
                                              size="small"
                                              sx={{
                                                height: 20,
                                                color: "#fff",
                                                backgroundColor:
                                                  "rgba(196,0,0,0.14)",
                                                fontSize: 11,
                                              }}
                                            />
                                          </Stack>

                                          <Typography
                                            sx={{
                                              color: "rgba(255,255,255,0.48)",
                                              fontSize: 12,
                                            }}
                                          >
                                            {formatDate(post.posted_at)}
                                          </Typography>
                                        </Box>
                                      </Stack>

                                      <Stack
                                        direction="row"
                                        spacing={0.5}
                                        alignItems="center"
                                        flexWrap="wrap"
                                      >
                                        <Button
                                          size="small"
                                          startIcon={
                                            <ThumbUpAlt sx={{ color: "#c40000" }} />
                                          }
                                          onClick={() => handleLike(post.id)}
                                          disabled={!!likeBetoltes[post.id]}
                                          sx={{
                                            color: "#fff",
                                            borderColor:
                                              "rgba(255,255,255,0.14)",
                                            minWidth: "auto",
                                          }}
                                          variant="outlined"
                                        >
                                          {likeBetoltes[post.id] ? "..." : "Like"}
                                        </Button>

                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleDeletePost(post.id)
                                          }
                                          sx={{ color: "#ff6b6b" }}
                                        >
                                          <Delete fontSize="small" />
                                        </IconButton>
                                      </Stack>
                                    </Stack>

                                    <Typography
                                      sx={{
                                        color: "#fff",
                                        lineHeight: 1.7,
                                        whiteSpace: "pre-wrap",
                                        fontSize: 14,
                                      }}
                                    >
                                      {post.content}
                                    </Typography>

                                    <Stack
                                      direction="row"
                                      spacing={2.2}
                                      alignItems="center"
                                      flexWrap="wrap"
                                    >
                                      <Stack
                                        direction="row"
                                        spacing={0.7}
                                        alignItems="center"
                                      >
                                        <ThumbUpAlt
                                          sx={{
                                            color: "#c40000",
                                            fontSize: 18,
                                          }}
                                        />
                                        <Typography
                                          sx={{
                                            color: "#c40000",
                                            fontWeight: 800,
                                            fontSize: 13,
                                          }}
                                        >
                                          {post.likes.length}
                                        </Typography>
                                      </Stack>

                                      <Typography
                                        sx={{
                                          color: "rgba(255,255,255,0.52)",
                                          fontSize: 12,
                                        }}
                                      >
                                        {post.replies.length} reply
                                      </Typography>
                                    </Stack>

                                    {post.likes.length > 0 && (
                                      <Box>
                                        <Typography
                                          sx={{
                                            mb: 0.8,
                                            color: "rgba(255,255,255,0.52)",
                                            fontSize: 12,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                          }}
                                        >
                                          Likes
                                        </Typography>

                                        <Stack
                                          direction="row"
                                          spacing={1}
                                          flexWrap="wrap"
                                          useFlexGap
                                        >
                                          {post.likes.map((like) => (
                                            <Chip
                                              key={like.id}
                                              icon={
                                                <ThumbUpAlt
                                                  sx={{
                                                    color:
                                                      "#c40000 !important",
                                                  }}
                                                />
                                              }
                                              label={like.user_username}
                                              onDelete={() =>
                                                handleUnlike(like.id)
                                              }
                                              deleteIcon={
                                                <Delete
                                                  sx={{
                                                    color:
                                                      "#ff6b6b !important",
                                                  }}
                                                />
                                              }
                                              size="small"
                                              sx={{
                                                color: "#fff",
                                                backgroundColor:
                                                  "rgba(196,0,0,0.14)",
                                                border:
                                                  "1px solid rgba(196,0,0,0.18)",
                                              }}
                                            />
                                          ))}
                                        </Stack>
                                      </Box>
                                    )}

                                    <Box
                                      sx={{
                                        mt: 0.5,
                                        pl: { xs: 1.5, md: 2.5 },
                                        borderLeft:
                                          "2px solid rgba(196,0,0,0.30)",
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          mb: 1,
                                          color: "rgba(255,255,255,0.58)",
                                          fontSize: 12,
                                          textTransform: "uppercase",
                                          letterSpacing: "0.06em",
                                          fontWeight: 700,
                                        }}
                                      >
                                        Replies
                                      </Typography>

                                      <Paper
                                        elevation={0}
                                        sx={{
                                          mb: 1.2,
                                          ml: { xs: 0, md: 2 },
                                          p: 1.5,
                                          borderRadius: 2,
                                          background: "rgba(255,255,255,0.03)",
                                          border: "1px solid rgba(255,255,255,0.05)",
                                        }}
                                      >
                                        <Typography
                                          sx={{
                                            mb: 1,
                                            color: "#fff",
                                            fontWeight: 700,
                                            fontSize: 13,
                                          }}
                                        >
                                          Válasz ehhez a hozzászóláshoz
                                        </Typography>

                                        <TextField
                                          fullWidth
                                          multiline
                                          minRows={2}
                                          placeholder="Írd meg a válaszod..."
                                          value={ujReplySzovegek[post.id] ?? ""}
                                          onChange={(e) =>
                                            setUjReplySzovegek((elozo) => ({
                                              ...elozo,
                                              [post.id]: e.target.value,
                                            }))
                                          }
                                          sx={{
                                            mb: 1.2,
                                            "& .MuiOutlinedInput-root": {
                                              color: "#fff",
                                              backgroundColor:
                                                "rgba(255,255,255,0.02)",
                                              "& fieldset": {
                                                borderColor:
                                                  "rgba(255,255,255,0.14)",
                                              },
                                              "&:hover fieldset": {
                                                borderColor:
                                                  "rgba(255,255,255,0.24)",
                                              },
                                              "&.Mui-focused fieldset": {
                                                borderColor: "#c40000",
                                              },
                                            },
                                            "& .MuiInputBase-input::placeholder": {
                                              color: "rgba(255,255,255,0.45)",
                                              opacity: 1,
                                            },
                                          }}
                                        />

                                        <Button
                                          variant="outlined"
                                          startIcon={<SubdirectoryArrowRight />}
                                          onClick={() => handleUjReply(post.id)}
                                          disabled={!!replyKuldesBetoltes[post.id]}
                                          sx={{
                                            color: "#fff",
                                            borderColor:
                                              "rgba(255,255,255,0.18)",
                                          }}
                                        >
                                          {replyKuldesBetoltes[post.id]
                                            ? "Küldés..."
                                            : "Reply küldése"}
                                        </Button>
                                      </Paper>

                                      {post.replies.length === 0 ? (
                                        <Paper
                                          elevation={0}
                                          sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            background:
                                              "rgba(255,255,255,0.02)",
                                            border:
                                              "1px dashed rgba(255,255,255,0.10)",
                                          }}
                                        >
                                          <Typography
                                            sx={{
                                              color:
                                                "rgba(255,255,255,0.50)",
                                              fontSize: 13,
                                            }}
                                          >
                                            Még nincs reply ehhez a posthoz.
                                          </Typography>
                                        </Paper>
                                      ) : (
                                        <Stack spacing={1.2}>
                                          {post.replies.map((reply) => (
                                            <Paper
                                              key={reply.id}
                                              elevation={0}
                                              sx={{
                                                ml: { xs: 0, md: 2 },
                                                p: 1.5,
                                                borderRadius: 2,
                                                background:
                                                  "rgba(255,255,255,0.03)",
                                                border:
                                                  "1px solid rgba(255,255,255,0.05)",
                                              }}
                                            >
                                              <Stack spacing={1}>
                                                <Stack
                                                  direction="row"
                                                  justifyContent="space-between"
                                                  alignItems="flex-start"
                                                >
                                                  <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                  >
                                                    <Avatar
                                                      sx={{
                                                        width: 30,
                                                        height: 30,
                                                        bgcolor: "#262626",
                                                        color: "#fff",
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                      }}
                                                    >
                                                      {userInitial(
                                                        reply.author_username
                                                      )}
                                                    </Avatar>

                                                    <Box>
                                                      <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        alignItems="center"
                                                        flexWrap="wrap"
                                                      >
                                                        <Typography
                                                          sx={{
                                                            fontWeight: 700,
                                                            color: "#fff",
                                                            fontSize: 13,
                                                          }}
                                                        >
                                                          {reply.author_username}
                                                        </Typography>

                                                        <Chip
                                                          label={roleLabel(
                                                            reply.author_username
                                                          )}
                                                          size="small"
                                                          sx={{
                                                            height: 18,
                                                            color: "#fff",
                                                            backgroundColor:
                                                              "rgba(255,255,255,0.07)",
                                                            fontSize: 10,
                                                          }}
                                                        />
                                                      </Stack>

                                                      <Typography
                                                        sx={{
                                                          color:
                                                            "rgba(255,255,255,0.46)",
                                                          fontSize: 11,
                                                        }}
                                                      >
                                                        {formatDate(
                                                          reply.replied_at
                                                        )}
                                                      </Typography>
                                                    </Box>
                                                  </Stack>

                                                  <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                      handleDeleteReply(
                                                        reply.id
                                                      )
                                                    }
                                                    sx={{ color: "#ff6b6b" }}
                                                  >
                                                    <Delete fontSize="small" />
                                                  </IconButton>
                                                </Stack>

                                                <Typography
                                                  sx={{
                                                    color: "#f3f3f3",
                                                    lineHeight: 1.65,
                                                    whiteSpace: "pre-wrap",
                                                    fontSize: 13,
                                                  }}
                                                >
                                                  {reply.content}
                                                </Typography>
                                              </Stack>
                                            </Paper>
                                          ))}
                                        </Stack>
                                      )}
                                    </Box>
                                  </Stack>
                                </Paper>
                              ))}
                            </Stack>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Paper>
            ))}
          </Stack>
        )}

        <CategoryDialog
          open={categoryDialog}
          form={categoryForm}
          onChange={(field, value) =>
            setCategoryForm({ ...categoryForm, [field]: value })
          }
          onClose={() => setCategoryDialog(false)}
          onSave={async () => {
            setSaving(true);
            setErrorText("");

            try {
              const form = categoryForm as CategoryForm & { id?: number };

              if (form.id) {
                await updateCategory(form.id, {
                  name: categoryForm.name,
                  description: categoryForm.description || null,
                });
              } else {
                await createCategory({
                  name: categoryForm.name,
                  description: categoryForm.description || null,
                });
              }

              setCategoryDialog(false);
              await refreshForumTree();
            } catch (err: any) {
              console.error(err);
              setErrorText(err?.message || "Category save failed.");
            } finally {
              setSaving(false);
            }
          }}
          saving={saving}
        />

        <TopicDialog
          open={topicDialog}
          form={topicForm}
          categories={categories}
          onChange={(field, value) =>
            setTopicForm({ ...topicForm, [field]: value })
          }
          onClose={() => setTopicDialog(false)}
          onSave={async () => {
            setSaving(true);
            setErrorText("");

            try {
              const form = topicForm as TopicForm & { id?: number };

              if (form.id) {
                await updateTopic(form.id, {
                  title: topicForm.title,
                  description: topicForm.description || null,
                  category_id: Number(topicForm.category_id),
                });
              } else {
                await createTopic({
                  title: topicForm.title,
                  description: topicForm.description || null,
                  category_id: Number(topicForm.category_id),
                });
              }

              setTopicDialog(false);
              await refreshForumTree();
            } catch (err: any) {
              console.error(err);
              setErrorText(err?.message || "Topic save failed.");
            } finally {
              setSaving(false);
            }
          }}
          saving={saving}
        />
      </Box>
    </Box>
  );
}