import React from "react";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import { Delete, ThumbUpAlt, SubdirectoryArrowRight } from "@mui/icons-material";

import type { UiPost } from "./forumTypes";
import { formatDate, roleLabel } from "./forumHelpers";
import UserAvatar from "./UserAvatar";
import LikeButton from "./LikeButton";
import ReplyCard from "./ReplyCard";

type Props = {
  post: UiPost;

  likeLoading?: boolean;
  replyLoading?: boolean;

  replyText?: string;

  onLike: (postId: number) => void;
  onUnlike: (likeId: number) => void;
  onDeletePost: (postId: number) => void;
  onDeleteReply: (replyId: number) => void;

  onReplyTextChange: (postId: number, value: string) => void;
  onReplySubmit: (postId: number) => void;
};

const PostCard: React.FC<Props> = ({
  post,
  likeLoading,
  replyLoading,
  replyText,
  onLike,
  onUnlike,
  onDeletePost,
  onDeleteReply,
  onReplyTextChange,
  onReplySubmit,
}) => {
  return (
    <Paper
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
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" spacing={1.2} alignItems="center">
            <UserAvatar name={post.author_username} />

            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
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
                    backgroundColor: "rgba(196,0,0,0.14)",
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

          <Stack direction="row" spacing={1}>
            <LikeButton postId={post.id} loading={likeLoading} onLike={onLike} />

            <IconButton
              size="small"
              onClick={() => onDeletePost(post.id)}
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

        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={0.7} alignItems="center">
            <ThumbUpAlt sx={{ color: "#c40000", fontSize: 18 }} />

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
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {post.likes.map((like) => (
              <Chip
                key={like.id}
                icon={
                  <ThumbUpAlt
                    sx={{
                      color: "#c40000 !important",
                    }}
                  />
                }
                label={like.user_username}
                onDelete={() => onUnlike(like.id)}
                deleteIcon={
                  <Delete
                    sx={{
                      color: "#ff6b6b !important",
                    }}
                  />
                }
                size="small"
                sx={{
                  color: "#fff",
                  backgroundColor: "rgba(196,0,0,0.14)",
                  border: "1px solid rgba(196,0,0,0.18)",
                }}
              />
            ))}
          </Stack>
        )}

        <Box
          sx={{
            mt: 0.5,
            pl: { xs: 1.5, md: 2.5 },
            borderLeft: "2px solid rgba(196,0,0,0.30)",
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

          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Írd meg a válaszodat..."
            value={replyText ?? ""}
            onChange={(e) => onReplyTextChange(post.id, e.target.value)}
            sx={{
              mb: 1.2,
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
              "& .MuiInputBase-input": {
                color: "#fff",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "rgba(255,255,255,0.45)",
                opacity: 1,
              },
              "& .MuiInputBase-inputMultiline": {
                color: "#fff",
              },
              "& .MuiOutlinedInput-input": {
                color: "#fff",
              },
            }}
          />

          <Button
            variant="outlined"
            startIcon={<SubdirectoryArrowRight />}
            onClick={() => onReplySubmit(post.id)}
            disabled={replyLoading}
            sx={{
              color: "#fff",
              borderColor: "rgba(255,255,255,0.18)",
            }}
          >
            {replyLoading ? "Küldés..." : "Reply küldése"}
          </Button>

          <Stack spacing={1.2} sx={{ mt: 1.5 }}>
            {post.replies.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                onDelete={onDeleteReply}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default PostCard;