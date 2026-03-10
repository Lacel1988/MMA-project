import React from "react";
import {
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
import { Delete, Edit, LocalFireDepartment, Send } from "@mui/icons-material";

import type { TopicForm } from "../dialogs/TopicDialog";
import type { UiTopic } from "./forumTypes";
import { formatDate, roleLabel } from "./forumHelpers";
import PostCard from "./PostCard";

type Props = {
  topic: UiTopic;
  categoryId: number;

  ujPostSzoveg?: string;
  postKuldesBetoltes?: boolean;
  likeBetoltes?: Record<number, boolean>;
  ujReplySzovegek?: Record<number, string>;
  replyKuldesBetoltes?: Record<number, boolean>;

  setTopicForm: React.Dispatch<React.SetStateAction<TopicForm>>;
  setTopicDialog: React.Dispatch<React.SetStateAction<boolean>>;

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

const TopicCard: React.FC<Props> = ({
  topic,
  categoryId,
  ujPostSzoveg,
  postKuldesBetoltes,
  likeBetoltes,
  ujReplySzovegek,
  replyKuldesBetoltes,
  setTopicForm,
  setTopicDialog,
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
            <LocalFireDepartment sx={{ color: "#c40000", fontSize: 20 }} />
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
                category_id: categoryId,
              });
              setTopicDialog(true);
            }}
            sx={{ color: "#fff" }}
          >
            <Edit fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => onDeleteTopic(topic.id)}
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
          value={ujPostSzoveg ?? ""}
          onChange={(e) => onUjPostChange(topic.id, e.target.value)}
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
          onClick={() => onUjPostSubmit(topic.id)}
          disabled={!!postKuldesBetoltes}
          sx={{
            backgroundColor: "#c40000",
            color: "#fff",
            fontWeight: 700,
            "&:hover": {
              backgroundColor: "#970000",
            },
          }}
        >
          {postKuldesBetoltes ? "Küldés..." : "Hozzászólás küldése"}
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
            <PostCard
              key={post.id}
              post={post}
              likeLoading={!!likeBetoltes?.[post.id]}
              replyLoading={!!replyKuldesBetoltes?.[post.id]}
              replyText={ujReplySzovegek?.[post.id] ?? ""}
              onLike={onLike}
              onUnlike={onUnlike}
              onDeletePost={onDeletePost}
              onDeleteReply={onDeleteReply}
              onReplyTextChange={onUjReplyChange}
              onReplySubmit={onUjReplySubmit}
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default TopicCard;