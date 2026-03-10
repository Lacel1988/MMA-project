import React from "react";
import { Button } from "@mui/material";
import { ThumbUpAlt } from "@mui/icons-material";

type Props = {
  postId: number;
  loading?: boolean;
  onLike: (postId: number) => void;
};

const LikeButton: React.FC<Props> = ({ postId, loading, onLike }) => {
  return (
    <Button
      size="small"
      startIcon={<ThumbUpAlt sx={{ color: "#c40000" }} />}
      onClick={() => onLike(postId)}
      disabled={loading}
      sx={{
        color: "#fff",
        borderColor: "rgba(255,255,255,0.14)",
        minWidth: "auto",
      }}
      variant="outlined"
    >
      {loading ? "..." : "Like"}
    </Button>
  );
};

export default LikeButton;