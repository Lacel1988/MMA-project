import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";

export type CategoryForm = {
  id?: number;
  name: string;
  description: string;
};

type Props = {
  open: boolean;
  form: CategoryForm;
  onChange: (field: keyof CategoryForm, value: string) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
};



const CategoryDialog: React.FC<Props> = ({
  open,
  form,
  onChange,
  onClose,
  onSave,
  saving,
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>{form.id ? "Edit Category" : "Create Category"}</DialogTitle>

    <DialogContent>
      <Box display="flex" flexDirection="column" gap={2} mt={1}>
        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
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
      </Box>
    </DialogContent>

    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button
        variant="contained"
        disabled={saving || !form.name.trim()}
        onClick={onSave}
      >
        Save
      </Button>
    </DialogActions>
  </Dialog>
);




export default CategoryDialog;