import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { IconButton } from "@mui/material";

type Props = {
  count: number;
  onLike?: () => void;
};

export default function LikeButton({ count, onLike }: Props) {
  return (
    <div className="like-button">
      <IconButton size="small" onClick={onLike}>
        <ThumbUpIcon sx={{ color: "#d20a0a" }} />
      </IconButton>
      <span>{count}</span>
    </div>
  );
}