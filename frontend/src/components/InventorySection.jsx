import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  InputAdornment,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddBoxIcon from '@mui/icons-material/AddBox';
import PostAddIcon from '@mui/icons-material/PostAdd';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CloseIcon from '@mui/icons-material/Close';

import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustInventoryStock,
  getInventoryMovements,
} from '../services/api';

export default function InventorySection({ currentUser }) {
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals state
  const [openAdjustModal, setOpenAdjustModal] = useState(false);
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState(null);
  const [adjustType, setAdjustType] = useState('ingreso_manual');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustRef, setAdjustRef] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');

  const [openNewItemModal, setOpenNewItemModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newUnit, setNewUnit] = useState('UNID');
  const [newStock, setNewStock] = useState('0');
  const [newMinStock, setNewMinStock] = useState('5');

  const [openMovementsModal, setOpenMovementsModal] = useState(false);
  const [loadingMovements, setLoadingMovements] = useState(false);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getInventory();
      setInventory(data || []);
    } catch (err) {
      setToast({ open: true, message: err.message || 'Error al cargar el inventario', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadMovementsData = async () => {
    setLoadingMovements(true);
    try {
      const movs = await getInventoryMovements(200);
      setMovements(movs || []);
      setOpenMovementsModal(true);
    } catch (err) {
      setToast({ open: true, message: err.message || 'Error al cargar el historial de movimientos', severity: 'error' });
    } finally {
      setLoadingMovements(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute categories
  const categories = ['ALL', ...new Set(inventory.map((i) => i.category || 'General'))];

  // Filtered inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // KPI calculations
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter((i) => i.stock > 0 && i.stock <= i.min_stock).length;
  const outOfStockItems = inventory.filter((i) => i.stock <= 0).length;
  const optimalItems = inventory.filter((i) => i.stock > i.min_stock).length;

  const handleOpenAdjust = (item = null) => {
    setSelectedItemForAdjust(item || (inventory.length > 0 ? inventory[0] : null));
    setAdjustType('ingreso_manual');
    setAdjustQty('');
    setAdjustRef('');
    setAdjustNotes('');
    setOpenAdjustModal(true);
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    if (!selectedItemForAdjust || !adjustQty || parseFloat(adjustQty) <= 0) {
      setToast({ open: true, message: 'Ingrese una cantidad válida mayor a 0.', severity: 'warning' });
      return;
    }

    const qty = parseFloat(adjustQty);
    const quantityDelta = adjustType === 'ingreso_manual' ? qty : -qty;

    try {
      const res = await adjustInventoryStock({
        item_id: selectedItemForAdjust.id,
        quantity_delta: quantityDelta,
        movement_type: adjustType,
        reference: adjustRef.trim() || (adjustType === 'ingreso_manual' ? 'Reposición de Stock' : 'Ajuste de inventario'),
        created_by: currentUser?.name || currentUser?.username || 'Admin',
        notes: adjustNotes.trim(),
      });
      setToast({ open: true, message: res.message || 'Stock actualizado exitosamente.', severity: 'success' });
      setOpenAdjustModal(false);
      loadData();
    } catch (err) {
      setToast({ open: true, message: err.message || 'Error al actualizar el stock.', severity: 'error' });
    }
  };

  const handleCreateNewItem = async (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) {
      setToast({ open: true, message: 'Código y Nombre son obligatorios.', severity: 'warning' });
      return;
    }

    try {
      const res = await createInventoryItem({
        code: newCode.trim().toUpperCase(),
        name: newName.trim(),
        category: newCategory.trim(),
        unit: newUnit.trim().toUpperCase(),
        stock: parseFloat(newStock) || 0,
        min_stock: parseFloat(newMinStock) || 5,
      });
      setToast({ open: true, message: res.message || 'Material agregado con éxito.', severity: 'success' });
      setOpenNewItemModal(false);
      setNewCode('');
      setNewName('');
      setNewStock('0');
      setNewMinStock('5');
      loadData();
    } catch (err) {
      setToast({ open: true, message: err.message || 'Error al crear material.', severity: 'error' });
    }
  };

  const handleDeleteItem = async (item) => {
    if (window.confirm(`¿Está seguro de eliminar '${item.name}' (${item.code}) del catálogo?`)) {
      try {
        await deleteInventoryItem(item.id);
        setToast({ open: true, message: 'Material eliminado con éxito.', severity: 'success' });
        loadData();
      } catch (err) {
        setToast({ open: true, message: err.message || 'Error al eliminar material.', severity: 'error' });
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 4, sm: 6 }, px: { xs: 1.5, sm: 3 } }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            <InventoryIcon sx={{ color: '#38bdf8', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc' }}>
              Inventario Central de Materiales
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Control global de stock con deducción automática en cada planilla de técnicos
            </Typography>
          </Box>
        </Box>

        {/* Top Actions */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<HistoryEduIcon />}
            onClick={loadMovementsData}
            disabled={loadingMovements}
            sx={{ borderRadius: 2 }}
          >
            Historial de Movimientos
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddBoxIcon />}
            onClick={() => handleOpenAdjust()}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              color: '#070b14',
              fontWeight: 700,
            }}
          >
            Reponer / Ajustar Stock
          </Button>

          <Button
            variant="outlined"
            startIcon={<PostAddIcon />}
            onClick={() => setOpenNewItemModal(true)}
            sx={{ borderRadius: 2, borderColor: 'rgba(255, 255, 255, 0.2)', color: '#f8fafc' }}
          >
            Nuevo Material
          </Button>

          <Tooltip title="Actualizar datos">
            <IconButton onClick={loadData} sx={{ color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Materiales
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#f8fafc', mt: 0.5 }}>
                {totalItems}
              </Typography>
              <Typography variant="caption" sx={{ color: '#38bdf8' }}>
                Catálogo general de insumos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, textTransform: 'uppercase' }}>
                Stock Óptimo
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981', mt: 0.5 }}>
                {optimalItems}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Con existencias suficientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase' }}>
                Stock Bajo
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b', mt: 0.5 }}>
                {lowStockItems}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Por debajo del mínimo
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, textTransform: 'uppercase' }}>
                Agotados
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#ef4444', mt: 0.5 }}>
                {outOfStockItems}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Requieren reposición urgente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table Paper */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        {/* Search & Category Filter Toolbar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Buscar por código SAP, descripción o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={selectedCategory}
              label="Categoría"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat === 'ALL' ? 'Todas las categorías' : cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Inventory Items Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : filteredInventory.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: '#94a3b8' }}>
              No se encontraron materiales que coincidan con los filtros.
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'rgba(56, 189, 248, 0.1)' }}>
                <TableRow>
                  <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>CÓDIGO SAP</TableCell>
                  <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>MATERIAL / INSUMO</TableCell>
                  <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>CATEGORÍA</TableCell>
                  <TableCell align="center" sx={{ color: '#38bdf8', fontWeight: 700 }}>STOCK ACTUAL</TableCell>
                  <TableCell align="center" sx={{ color: '#38bdf8', fontWeight: 700 }}>MÍNIMO</TableCell>
                  <TableCell align="center" sx={{ color: '#38bdf8', fontWeight: 700 }}>ESTADO</TableCell>
                  <TableCell align="center" sx={{ color: '#38bdf8', fontWeight: 700 }}>ACCIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInventory.map((item) => {
                  const isLow = item.stock > 0 && item.stock <= item.min_stock;
                  const isOut = item.stock <= 0;
                  const progressValue = Math.min(100, Math.round((item.stock / (item.min_stock * 2 || 10)) * 100));

                  return (
                    <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Chip
                          label={item.code}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            backgroundColor: 'rgba(56, 189, 248, 0.1)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ fontWeight: 600, color: '#f8fafc' }}>
                        {item.name}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                          {item.category || 'General'}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#38bdf8' }}>
                            {item.stock} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.unit}</span>
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={progressValue}
                            sx={{
                              width: '100%',
                              height: 4,
                              borderRadius: 2,
                              mt: 0.5,
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#10b981',
                              },
                            }}
                          />
                        </Box>
                      </TableCell>

                      <TableCell align="center" sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        {item.min_stock} {item.unit}
                      </TableCell>

                      <TableCell align="center">
                        {isOut ? (
                          <Chip
                            icon={<ErrorOutlineIcon sx={{ fontSize: 14 }} />}
                            label="Agotado"
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        ) : isLow ? (
                          <Chip
                            icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
                            label="Stock Bajo"
                            size="small"
                            sx={{ color: '#f59e0b', borderColor: '#f59e0b' }}
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            icon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
                            label="Óptimo"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="Reponer / Ajustar stock">
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={() => handleOpenAdjust(item)}
                              sx={{ py: 0.2, px: 1, fontSize: '0.75rem', borderRadius: 1.5 }}
                            >
                              + / - Stock
                            </Button>
                          </Tooltip>

                          <Tooltip title="Eliminar del catálogo">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteItem(item)}
                              sx={{ '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.15)' } }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ========================================== */}
      {/* MODAL: REPONER / AJUSTAR STOCK              */}
      {/* ========================================== */}
      <Dialog open={openAdjustModal} onClose={() => setOpenAdjustModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#f8fafc', pb: 1 }}>
          Ajuste / Reposición de Inventario
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            {/* Selected item display */}
            <FormControl fullWidth size="small">
              <InputLabel>Material a ajustar</InputLabel>
              <Select
                value={selectedItemForAdjust ? selectedItemForAdjust.id : ''}
                label="Material a ajustar"
                onChange={(e) => {
                  const item = inventory.find((i) => i.id === e.target.value);
                  setSelectedItemForAdjust(item);
                }}
              >
                {inventory.map((i) => (
                  <MenuItem key={i.id} value={i.id}>
                    {i.code} — {i.name} (Stock: {i.stock} {i.unit})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Tipo de Movimiento</InputLabel>
              <Select
                value={adjustType}
                label="Tipo de Movimiento"
                onChange={(e) => setAdjustType(e.target.value)}
              >
                <MenuItem value="ingreso_manual">🟢 Ingreso / Compra / Reposición (+)</MenuItem>
                <MenuItem value="ajuste">🔴 Salida / Merma / Corrección (-)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              required
              fullWidth
              size="small"
              label={`Cantidad a ${adjustType === 'ingreso_manual' ? 'sumar' : 'restar'} (${selectedItemForAdjust?.unit || 'UNID'})`}
              type="number"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              placeholder="Ej: 50"
              inputProps={{ min: 0.1, step: 'any' }}
            />

            <TextField
              fullWidth
              size="small"
              label="Referencia / Nro. Factura o Guía"
              value={adjustRef}
              onChange={(e) => setAdjustRef(e.target.value)}
              placeholder="Ej: Compra Proveedor #2026-08 / Lote 44"
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              label="Notas u Observaciones (Opcional)"
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
              placeholder="Detalle o justificación del movimiento..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpenAdjustModal(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSaveAdjust} variant="contained" color="primary" sx={{ fontWeight: 700 }}>
            Confirmar Movimiento
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================== */}
      {/* MODAL: NUEVO PRODUCTO                       */}
      {/* ========================================== */}
      <Dialog open={openNewItemModal} onClose={() => setOpenNewItemModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#f8fafc', pb: 1 }}>
          Alta de Nuevo Material al Catálogo
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              required
              fullWidth
              size="small"
              label="Código SAP / SKU"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Ej: INV-200-0099"
            />

            <TextField
              required
              fullWidth
              size="small"
              label="Nombre del Material"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej: Conector Rápido Mecánico SC-UPC"
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Categoría"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Ej: Conectores"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Unidad (UNID / MTS / PZ)"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="Ej: UNID"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Stock Inicial"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Stock Mínimo (Alerta)"
                  value={newMinStock}
                  onChange={(e) => setNewMinStock(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpenNewItemModal(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleCreateNewItem} variant="contained" color="primary" sx={{ fontWeight: 700 }}>
            Guardar Material
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================== */}
      {/* MODAL: HISTORIAL DE MOVIMIENTOS            */}
      {/* ========================================== */}
      <Dialog open={openMovementsModal} onClose={() => setOpenMovementsModal(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryEduIcon sx={{ color: '#38bdf8' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc' }}>
              Historial de Auditoría de Movimientos ({movements.length})
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenMovementsModal(false)} size="small" sx={{ color: '#94a3b8' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {movements.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                No hay movimientos registrados en el sistema.
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 500, borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Table size="small" stickyHeader>
                <TableHead sx={{ backgroundColor: '#0f172a' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>FECHA / HORA</TableCell>
                    <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>MATERIAL</TableCell>
                    <TableCell align="center" sx={{ color: '#38bdf8', fontWeight: 700 }}>TIPO</TableCell>
                    <TableCell align="center" sx={{ color: '#38bdf8', fontWeight: 700 }}>CANTIDAD</TableCell>
                    <TableCell align="center" sx={{ color: '#38bdf8', fontWeight: 700 }}>STOCK RESULTANTE</TableCell>
                    <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>REFERENCIA</TableCell>
                    <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>REGISTRADO POR</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements.map((m) => {
                    const isPositive = m.quantity > 0;
                    return (
                      <TableRow key={m.id} hover>
                        <TableCell sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                          {m.created_at}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#f8fafc' }}>
                          {m.item_name} <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({m.item_code})</span>
                        </TableCell>
                        <TableCell align="center">
                          {m.movement_type === 'consumo_planilla' ? (
                            <Chip label="Consumo Planilla" size="small" color="info" variant="outlined" />
                          ) : m.movement_type === 'ingreso_manual' ? (
                            <Chip label="Ingreso Stock" size="small" color="success" variant="outlined" />
                          ) : (
                            <Chip label={m.movement_type} size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: isPositive ? '#10b981' : '#ef4444' }}>
                          {isPositive ? `+${m.quantity}` : m.quantity}
                        </TableCell>
                        <TableCell align="center" sx={{ color: '#f8fafc', fontWeight: 600 }}>
                          {m.new_stock}
                        </TableCell>
                        <TableCell sx={{ color: '#cbd5e1' }}>
                          {m.reference || '-'}
                        </TableCell>
                        <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          {m.created_by || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

      {/* Toast notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
