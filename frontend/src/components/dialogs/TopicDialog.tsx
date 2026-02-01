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

export type TopicForm = {
  id?: number;
  title: string;
  description: string;
  category_id: number | "";
};

type Category = { id: number; name: string };

type Props = {
  open: boolean;
  form: TopicForm;
  categories: Category[];
  onChange: (field: keyof TopicForm, value: string | number) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
};

const TopicDialog: React.FC<Props> = ({
  open,
  form,
  categories,
  onChange,
  onClose,
  onSave,
  saving,
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>{form.id ? "Edit Topic" : "Create Topic"}</DialogTitle>

    <DialogContent>
      <Box display="flex" flexDirection="column" gap={2} mt={1}>
        <TextField
          label="Title"
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
          fullWidth
          required
        />

        <TextField
          label="Description"
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          fullWidth
          multiline
          minRows={3}
        />

        <FormControl fullWidth required>
          <InputLabel>Category</InputLabel>
          <Select
            value={form.category_id}
            label="Category"
            onChange={(e) => onChange("category_id", e.target.value as number)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
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
        disabled={saving || !form.title.trim() || !form.category_id}
        onClick={onSave}
      >
        Save
      </Button>
    </DialogActions>
  </Dialog>
);

export default TopicDialog;