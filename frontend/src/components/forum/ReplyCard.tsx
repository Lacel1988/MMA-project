import React from "react";
import { Box, Chip, IconButton, Paper, Stack, Typography } from "@mui/material";
import { Delete } from "@mui/icons-material";

import type { UiReply } from "./forumTypes";
import { formatDate, roleLabel } from "./forumHelpers";
import UserAvatar from "./UserAvatar";

type Props = {
  reply: UiReply;
  onDelete: (id: number) => void;
};

const ReplyCard: React.FC<Props> = ({ reply, onDelete }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        ml: { xs: 0, md: 2 },
        p: 1.5,
        borderRadius: 2,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <Stack spacing={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <UserAvatar
              name={reply.author_username}
              size={30}
              bgColor="#262626"
              fontSize={13}
            />

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
                  label={roleLabel(reply.author_username)}
                  size="small"
                  sx={{
                    height: 18,
                    color: "#fff",
                    backgroundColor: "rgba(255,255,255,0.07)",
                    fontSize: 10,
                  }}
                />
              </Stack>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.46)",
                  fontSize: 11,
                }}
              >
                {formatDate(reply.replied_at)}
              </Typography>
            </Box>
          </Stack>

          <IconButton
            size="small"
            onClick={() => onDelete(reply.id)}
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
  );
};

export default ReplyCard;