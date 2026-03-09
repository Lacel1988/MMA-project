import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export type PostLikeForm = {
  id?: number;
  post: number | "";
};

type Post = { id: number; content: string };

type Props = {
  open: boolean;
  form: PostLikeForm;
  posts: Post[];
  onChange: (field: keyof PostLikeForm, value: string | number) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
};

const PostLikeDialog: React.FC<Props> = ({
  open,
  form,
  posts,
  onChange,
  onClose,
  onSave,
  saving,
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>{form.id ? "Edit Like" : "Create Like"}</DialogTitle>

    <DialogContent>
      <Box display="flex" flexDirection="column" gap={2} mt={1}>
        <FormControl fullWidth required>
          <InputLabel>Post</InputLabel>
          <Select
            value={form.post}
            label="Post"
            onChange={(e) => onChange("post", e.target.value as number)}
          >
            {posts.map((post) => (
              <MenuItem key={post.id} value={post.id}>
                {post.content.slice(0, 40)}...
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </DialogContent>

    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button
        variant="contained"
        disabled={saving || !form.post}
        onClick={onSave}
      >
        Save
      </Button>
    </DialogActions>
  </Dialog>
);

export default PostLikeDialog;