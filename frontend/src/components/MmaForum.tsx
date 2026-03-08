import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Stack,
  Alert,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

//import type { Category } from "../api/forumApi";
import type { Category, Topic, Reply, Post, Like } from "../api/forumApi";
import { listCategories, createCategory, updateCategory, deleteCategory, listTopics, getTopic, createTopic, updateTopic, deleteTopic, listPosts, getPost, createPost, updatePost, deletePost, listReplies, createReply, updateReply, deleteReply, likePost, unlikePost, listPostLikes } from "../api/forumApi";
//import { listCategories, createCategory, updateCategory, deleteCategory } from "../api/forumApi";

type CategoryFormState = {
  id?: number;
  name: string;
  description: string;
};

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState<CategoryFormState>({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setError(null);
      setLoading(true);
      const data = await listCategories();
      setCategories(data);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const handleOpenCreate = () => {
    setForm({ name: "", description: "" });
    setOpenDialog(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setForm({
      id: cat.id,
      name: cat.name,
      description: cat.description ?? "",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (field: keyof CategoryFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() ? form.description.trim() : null,
      };

      if (form.id) {
        await updateCategory(form.id, payload);
      } else {
        await createCategory(payload);
      }

      await refresh();
      setOpenDialog(false);
    } catch (e: any) {
      setError(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Biztos törlöd ezt a kategóriát?")) return;
    try {
      setError(null);
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      setError(e?.message || "Delete failed.");
    }
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Categories</Typography>
        <Button variant="contained" onClick={handleOpenCreate}>
          New category
        </Button>
      </Stack>

      {error && (
        <Box mb={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>{cat.id}</TableCell>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>{cat.description}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenEdit(cat)} size="small">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(cat.id)} size="small" color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {categories.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography align="center">No categories yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? "Edit category" : "Create category"}</DialogTitle>
        <DialogContent>
          <Box mt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.name.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;