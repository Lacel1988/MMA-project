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

export type PostForm = {
  id?: number;
  topic: number | "";
  content: string;
};

type Topic = { id: number; title: string };

type Props = {
  open: boolean;
  form: PostForm;
  topics: Topic[];
  onChange: (field: keyof PostForm, value: string | number) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
};

const PostDialog: React.FC<Props> = ({
  open,
  form,
  topics,
  onChange,
  onClose,
  onSave,
  saving,
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>{form.id ? "Edit Post" : "Create Post"}</DialogTitle>

    <DialogContent>
      <Box display="flex" flexDirection="column" gap={2} mt={1}>
        <FormControl fullWidth required>
          <InputLabel>Topic</InputLabel>
          <Select
            value={form.topic}
            label="Topic"
            onChange={(e) => onChange("topic", e.target.value as number)}
          >
            {topics.map((topic) => (
              <MenuItem key={topic.id} value={topic.id}>
                {topic.title}
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
        disabled={saving || !form.topic || !form.content.trim()}
        onClick={onSave}
      >
        Save
      </Button>
    </DialogActions>
  </Dialog>
);

export default PostDialog;