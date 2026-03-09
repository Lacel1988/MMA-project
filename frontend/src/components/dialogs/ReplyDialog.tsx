import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export type ReplyForm = {
  id?: number;
  post: number | "";
  content: string;
};

type Post = { id: number; content: string };

type Props = {
  open: boolean;
  form: ReplyForm;
  posts: Post[];
  onChange: (field: keyof ReplyForm, value: string | number) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
};

const ReplyDialog: React.FC<Props> = ({
  open,
  form,
  posts,
  onChange,
  onClose,
  onSave,
  saving,
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>{form.id ? "Edit Reply" : "Create Reply"}</DialogTitle>

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

        <TextField
          label="Content"
          value={form.content}
          onChange={(e) => onChange("content", e.target.value)}
          fullWidth
          multiline
          minRows={3}
        />
      </Box>
    </DialogContent>

    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button
        variant="contained"
        disabled={saving || !form.post || !form.content.trim()}
        onClick={onSave}
      >
        Save
      </Button>
    </DialogActions>
  </Dialog>
);

export default ReplyDialog;