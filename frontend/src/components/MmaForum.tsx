import React, { useEffect, useState } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";

import CategoryDialog, { type CategoryForm } from "./dialogs/CategoryDialog";
import TopicDialog, { type TopicForm } from "./dialogs/TopicDialog";
import CategoryCard from "./forum/CategoryCard";

import type { UiCategory } from "./forum/forumTypes";
import {
  normalizeCategory,
  normalizeTopic,
  normalizePost,
} from "./forum/forumHelpers";

import type { MeResponse } from "../api/authApi";

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

export default function MmaForum({ user }: { user: MeResponse | null }) {
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

  const [ujPostSzovegek, setUjPostSzovegek] = useState<Record<number, string>>(
    {}
  );
  const [ujReplySzovegek, setUjReplySzovegek] = useState<
    Record<number, string>
  >({});
  const [likeBetoltes, setLikeBetoltes] = useState<Record<number, boolean>>({});
  const [postKuldesBetoltes, setPostKuldesBetoltes] = useState<
    Record<number, boolean>
  >({});
  const [replyKuldesBetoltes, setReplyKuldesBetoltes] = useState<
    Record<number, boolean>
  >({});

  async function refreshForumTree(): Promise<void> {
    setLoading(true);
    setErrorText("");

    try {
      const rawCategories = await listCategories();
      const baseCategories = rawCategories.map((item) =>
        normalizeCategory(item)
      );

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
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteCategory(id);
      await refreshForumTree();
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || "Category delete failed.");
    }
  }

  async function handleDeleteTopic(id: number): Promise<void> {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;

    try {
      await deleteTopic(id);
      await refreshForumTree();
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || "Topic delete failed.");
    }
  }

  async function handleDeletePost(id: number): Promise<void> {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deletePost(id);
      await refreshForumTree();
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || "Post delete failed.");
    }
  }

  async function handleDeleteReply(id: number): Promise<void> {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;

    try {
      await deleteReply(id);
      await refreshForumTree();
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || "Reply delete failed.");
    }
  }

  async function handleUnlike(id: number): Promise<void> {
    if (!window.confirm("Are you sure you want to delete this like?")) return;

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
      setErrorText("The comment cannot be empty.");
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
      setErrorText("The reply cannot be empty.");
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
    <Box sx={{ px: 3, py: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight={700}>
            MMA Forum
          </Typography>

          {user?.is_superuser && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setCategoryForm({ name: "", description: "" });
                setCategoryDialog(true);
              }}
              sx={{
                backgroundColor: "#c62828",
                color: "#fff",
                fontWeight: 700,
                "&:hover": {
                  backgroundColor: "#8e0000",
                },
              }}
            >
              Add Category
            </Button>
          )}
        </Stack>

        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            ujPostSzovegek={ujPostSzovegek}
            likeBetoltes={likeBetoltes}
            ujReplySzovegek={ujReplySzovegek}
            postKuldesBetoltes={postKuldesBetoltes}
            replyKuldesBetoltes={replyKuldesBetoltes}
            setCategoryForm={setCategoryForm}
            setCategoryDialog={setCategoryDialog}
            setTopicForm={setTopicForm}
            setTopicDialog={setTopicDialog}
            onDeleteCategory={handleDeleteCategory}
            onDeleteTopic={handleDeleteTopic}
            onLike={handleLike}
            onUnlike={handleUnlike}
            onDeletePost={handleDeletePost}
            onDeleteReply={handleDeleteReply}
            onUjPostChange={(topicId, value) =>
              setUjPostSzovegek((elozo) => ({
                ...elozo,
                [topicId]: value,
              }))
            }
            onUjPostSubmit={handleUjPost}
            onUjReplyChange={(postId, value) =>
              setUjReplySzovegek((elozo) => ({
                ...elozo,
                [postId]: value,
              }))
            }
            onUjReplySubmit={handleUjReply}
          />
        ))}
      </Stack>

      <CategoryDialog
        open={categoryDialog}
        form={categoryForm}
        onChange={(field, value) =>
          setCategoryForm({ ...categoryForm, [field]: value })
        }
        onClose={() => setCategoryDialog(false)}
        onSave={async () => {
          if (!user?.is_superuser) {
            setErrorText("You do not have permission to do this.");
            setCategoryDialog(false);
            return;
          }

          setSaving(true);
          try {
            if (categoryForm.id) {
              await updateCategory(categoryForm.id, categoryForm);
            } else {
              await createCategory(categoryForm);
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
          try {
            if (topicForm.id) {
              await updateTopic(topicForm.id, topicForm);
            } else {
              await createTopic(topicForm);
            }

            setTopicDialog(false);
            await refreshForumTree();
          } finally {
            setSaving(false);
          }
        }}
        saving={saving}
      />
    </Box>
  );
}