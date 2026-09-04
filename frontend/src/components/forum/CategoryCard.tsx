import React from "react";
import { Box, Button, Chip, IconButton, Paper, Stack, Typography } from "@mui/material";
import { Add, Delete, Edit, Forum } from "@mui/icons-material";

import type { CategoryForm } from "../dialogs/CategoryDialog";
import type { TopicForm } from "../dialogs/TopicDialog";
import type { UiCategory } from "./forumTypes";
import TopicCard from "./TopicCard";

type Props = {
  category: UiCategory;

  ujPostSzovegek?: Record<number, string>;
  likeBetoltes?: Record<number, boolean>;
  ujReplySzovegek?: Record<number, string>;
  postKuldesBetoltes?: Record<number, boolean>;
  replyKuldesBetoltes?: Record<number, boolean>;

  setCategoryForm: React.Dispatch<React.SetStateAction<CategoryForm>>;
  setCategoryDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setTopicForm: React.Dispatch<React.SetStateAction<TopicForm>>;
  setTopicDialog: React.Dispatch<React.SetStateAction<boolean>>;

  onDeleteCategory: (id: number) => void;
  onDeleteTopic: (id: number) => void;
  onLike: (postId: number) => void;
  onUnlike: (likeId: number) => void;
  onDeletePost: (postId: number) => void;
  onDeleteReply: (replyId: number) => void;
  onUjPostChange: (topicId: number, value: string) => void;
  onUjPostSubmit: (topicId: number) => void;
  onUjReplyChange: (postId: number, value: string) => void;
  onUjReplySubmit: (postId: number) => void;
};

const CategoryCard: React.FC<Props> = ({
  category,
  ujPostSzovegek,
  likeBetoltes,
  ujReplySzovegek,
  postKuldesBetoltes,
  replyKuldesBetoltes,
  setCategoryForm,
  setCategoryDialog,
  setTopicForm,
  setTopicDialog,
  onDeleteCategory,
  onDeleteTopic,
  onLike,
  onUnlike,
  onDeletePost,
  onDeleteReply,
  onUjPostChange,
  onUjPostSubmit,
  onUjReplyChange,
  onUjReplySubmit,
}) => {
  return (
    <Paper
      data-testid="forum-category"
      data-category-id={category.id}
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
                });
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
              aria-label={`Edit category ${category.name}`}
              size="small"
              onClick={() => {
                setCategoryForm({
                  id: category.id,
                  name: category.name,
                  description: category.description ?? "",
                });
                setCategoryDialog(true);
              }}
              sx={{ color: "#fff" }}
            >
              <Edit fontSize="small" />
            </IconButton>

            <IconButton
              aria-label={`Delete category ${category.name}`}
              size="small"
              onClick={() => onDeleteCategory(category.id)}
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
            There are no topics in this category yet.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {category.topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                categoryId={category.id}
                ujPostSzoveg={ujPostSzovegek?.[topic.id] ?? ""}
                postKuldesBetoltes={!!postKuldesBetoltes?.[topic.id]}
                likeBetoltes={likeBetoltes}
                ujReplySzovegek={ujReplySzovegek}
                replyKuldesBetoltes={replyKuldesBetoltes}
                setTopicForm={setTopicForm}
                setTopicDialog={setTopicDialog}
                onDeleteTopic={onDeleteTopic}
                onLike={onLike}
                onUnlike={onUnlike}
                onDeletePost={onDeletePost}
                onDeleteReply={onDeleteReply}
                onUjPostChange={onUjPostChange}
                onUjPostSubmit={onUjPostSubmit}
                onUjReplyChange={onUjReplyChange}
                onUjReplySubmit={onUjReplySubmit}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default CategoryCard;
