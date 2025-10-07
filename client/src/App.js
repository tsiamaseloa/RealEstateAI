import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Card, CardContent, Grid, Typography, TextField, Button,
  IconButton, Chip, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';

// ✅ Use environment variable for backend base URL
const API_BASE = process.env.REACT_APP_API_BASE;
const API = `${API_BASE}/api/properties`;

export default function App() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---- CRUD helpers ----
  const fetchProps = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API);
      setProperties(data);
      setError(null);
    } catch (e) {
      setError('Backend unreachable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProps();
    const id = setInterval(fetchProps, 30000); // auto-refresh every 30s
    return () => clearInterval(id);
  }, []);

  // ---- KPIs ----
  const avgPrice = properties.length ? (properties.reduce((a, b) => a + Number(b.price), 0) / properties.length).toFixed(0) : 0;
  const maxPrice = properties.length ? Math.max(...properties.map(p => Number(p.price))) : 0;

  // ---- Add ----
  const [addForm, setAddForm] = useState({ title: '', price: '', location: '' });
  const handleAdd = async () => {
    if (!addForm.title || !addForm.price) return;
    await axios.post(API, addForm);
    setAddForm({ title: '', price: '', location: '' });
    fetchProps();
  };

  // ---- Delete ----
  const handleDelete = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchProps();
  };

  // ---- Edit ----
  const [editForm, setEditForm] = useState({ title: '', price: '', location: '' });
  const [editing, setEditing] = useState(null);

  const startEdit = (property) => {
    setEditing(property._id);
    setEditForm({ title: property.title, price: property.price, location: property.location });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditForm({ title: '', price: '', location: '' });
  };

  const handleUpdate = async () => {
    await axios.put(`${API}/${editing}`, editForm);
    setEditing(null);
    setEditForm({ title: '', price: '', location: '' });
    fetchProps();
  };

  // ---- JSX ----
  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* KPI strip */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={4}><KPI label="Total" value={properties.length} /></Grid>
        <Grid item xs={4}><KPI label="Avg Price" value={`$${avgPrice}`} /></Grid>
        <Grid item xs={4}><KPI label="Max Price" value={`$${maxPrice}`} /></Grid>
      </Grid>

      {/* Error banner */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Add card */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField size="small" placeholder="Title" value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} />
          <TextField size="small" placeholder="Price" type="number" value={addForm.price} onChange={(e) => setAddForm({ ...addForm, price: e.target.value })} />
          <TextField size="small" placeholder="Location" value={addForm.location} onChange={(e) => setAddForm({ ...addForm, location: e.target.value })} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>Add</Button>
        </CardContent>
      </Card>

      {/* Property cards */}
      {loading && <Box textAlign="center" py={4}><CircularProgress /></Box>}
      <Grid container spacing={3}>
        {properties.map((p) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={p._id}>
            <Card sx={{ boxShadow: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" noWrap>{p.title}</Typography>
                <Typography variant="h5" color="primary.main">${p.price}</Typography>
                <Chip label={p.location} size="small" sx={{ mt: 1 }} />
              </CardContent>
              <Box sx={{ p: 1, textAlign: 'right' }}>
                <IconButton color="primary" onClick={() => startEdit(p)}><EditIcon /></IconButton>
                <IconButton color="error" onClick={() => handleDelete(p._id)}><DeleteIcon /></IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit dialog */}
      <Dialog open={Boolean(editing)} onClose={cancelEdit}>
        <DialogTitle>Edit Property</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
          <TextField label="Price" type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
          <TextField label="Location" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button startIcon={<CloseIcon />} onClick={cancelEdit}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleUpdate}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ---- Re-usable KPI card ----
function KPI({ label, value }) {
  return (
    <Card sx={{ boxShadow: 2, textAlign: 'center', py: 2 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h4">{value}</Typography>
    </Card>
  );
}

