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
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

type Category = {
  id: number;
  name: string;
  description: string | null;
};

type CategoryFormState = {
  id?: number;
  name: string;
  description: string;
};

const API_BASE = "/api/categories/";

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState<CategoryFormState>({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
      const isEdit = !!form.id;
      const url = isEdit ? `${API_BASE}${form.id}/` : API_BASE;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
        }),
      });

      if (!res.ok) {
        console.error("Save failed", await res.text());
        return;
      }

      await fetchCategories();
      setOpenDialog(false);
    } catch (err) {
      console.error("Error saving category", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Biztosan törlöd ezt a kategóriát?")) return;
    try {
      const res = await fetch(`${API_BASE}${id}/`, {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error("Delete failed", await res.text());
        return;
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting category", err);
    }
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Categories</Typography>
        <Button variant="contained" color="primary" onClick={handleOpenCreate}>
          Új kategória
        </Button>
      </Stack>

      {loading ? (
        <Typography>Betöltés...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Név</TableCell>
                <TableCell>Leírás</TableCell>
                <TableCell align="right">Műveletek</TableCell>
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
                    <IconButton
                      onClick={() => handleDelete(cat.id)}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography align="center">Nincs még kategória.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {form.id ? "Kategória szerkesztése" : "Új kategória létrehozása"}
        </DialogTitle>
        <DialogContent>
          <Box mt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Név"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Leírás"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Mégse</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !form.name.trim()}
          >
            Mentés
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;