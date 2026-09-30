import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Grid,
  Card,
  Dialog,
  DialogContent,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import TableChartIcon from '@mui/icons-material/TableChart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DrawIcon from '@mui/icons-material/Draw';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import {
  getRecords,
  downloadRecordsExcel,
  downloadNetunoIndividualExcel,
  downloadNetunoRelacionExcel,
  openRecordPdf,
  getAttachmentUrl,
} from '../services/api';

function RecordRow({ record, isAdmin }) {
  const [open, setOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const executedItems = record.activities ? record.activities.filter((a) => a.checked) : [];
  const attachments = record.attachments || [];

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell fontWeight="bold">
          <Chip label={`#${record.solicitud_num}`} color="primary" variant="outlined" size="small" />
        </TableCell>
        <TableCell fontWeight="600">{record.client_name}</TableCell>
        <TableCell>{record.created_by}</TableCell>
        <TableCell>{record.created_at}</TableCell>
        <TableCell align="center">
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Tooltip title="Presupuesto Individual NetUno (.xlsx con plantilla oficial, fórmulas y materiales)">
              <Button
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#0369a1' },
                }}
                startIcon={<ReceiptLongIcon />}
                onClick={() => downloadNetunoIndividualExcel(record.id)}
              >
                NetUno
              </Button>
            </Tooltip>

            <Tooltip title="Descargar planilla completa en formato Excel estándar">
              <Button
                variant="outlined"
                size="small"
                color="success"
                sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                startIcon={<FileDownloadIcon />}
                onClick={() => downloadRecordsExcel(null, record.id)}
              >
                Excel
              </Button>
            </Tooltip>

            <Tooltip title="Ver / Imprimir Reporte PDF oficial de esta planilla">
              <Button
                variant="outlined"
                size="small"
                color="primary"
                sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                startIcon={<PictureAsPdfIcon />}
                onClick={() => openRecordPdf(record.id, false)}
              >
                PDF
              </Button>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2.5, backgroundColor: 'rgba(15, 23, 42, 0.65)', borderRadius: 3, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {/* Quick NetUno Individual Export banner */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  mb: 2.5,
                  borderRadius: 2,
                  backgroundColor: 'rgba(2, 132, 199, 0.1)',
                  border: '1px solid rgba(2, 132, 199, 0.25)',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptLongIcon sx={{ color: '#38bdf8' }} />
                  <Typography variant="body2" sx={{ color: '#e0f2fe', fontWeight: 600 }}>
                    Presupuesto Individual NetUno para Solicitud #{record.solicitud_num}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: '#0284c7',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#0369a1' },
                  }}
                  startIcon={<FileDownloadIcon />}
                  onClick={() => downloadNetunoIndividualExcel(record.id)}
                >
                  Descargar Presupuesto (.xlsx)
                </Button>
              </Box>
              {/* GPS & Signature Indicators */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                {record.gps_lat && record.gps_lng && (
                  <Chip
                    icon={<LocationOnIcon sx={{ color: '#10b981 !important' }} />}
                    label={`GPS: ${record.gps_lat}, ${record.gps_lng}${record.gps_accuracy ? ` (±${record.gps_accuracy}m)` : ''}`}
                    component="a"
                    href={`https://maps.google.com/?q=${record.gps_lat},${record.gps_lng}`}
                    target="_blank"
                    clickable
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontWeight: 600,
                    }}
                  />
                )}

                {record.signature_data && (
                  <Chip
                    icon={<DrawIcon sx={{ color: '#38bdf8 !important' }} />}
                    label="Firma de Conformidad Registrada"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>

              {/* Materials & Activities */}
              <Typography variant="subtitle2" sx={{ color: '#38bdf8', fontWeight: 700 }} gutterBottom>
                Detalle de Actividades Ejecutadas ({executedItems.length} materiales/tareas):
              </Typography>

              {executedItems.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                  No se seleccionaron materiales ni actividades en este registro.
                </Typography>
              ) : (
                <Table size="small" sx={{ mb: 3, backgroundColor: 'rgba(7, 11, 20, 0.4)', borderRadius: 2 }}>
                  <TableHead sx={{ backgroundColor: 'rgba(56, 189, 248, 0.1)' }}>
                    <TableRow>
                      <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>Material / Actividad</TableCell>
                      <TableCell align="center" sx={{ color: '#38bdf8', fontWeight: 700 }}>Detalle / Especificación</TableCell>
                      <TableCell align="center" sx={{ color: '#38bdf8', fontWeight: 700 }}>Unid / MTS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {executedItems.map((act, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ color: '#e2e8f0' }}>{act.description || act.name}</TableCell>
                        <TableCell align="center" sx={{ color: '#94a3b8' }}>{act.detail || '-'}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: '#38bdf8' }}>
                          {act.unid_mts || '1'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Technical Observations */}
              <Typography variant="subtitle2" sx={{ color: '#38bdf8', fontWeight: 700 }} gutterBottom>
                Observaciones Técnicas:
              </Typography>
              <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 3, fontStyle: record.observations ? 'normal' : 'italic' }}>
                {record.observations || 'Sin observaciones adicionales.'}
              </Typography>

              {/* Digital Signature Box if present */}
              {record.signature_data && (
                <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(7, 11, 20, 0.5)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Typography variant="subtitle2" sx={{ color: '#38bdf8', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <DrawIcon sx={{ fontSize: 18 }} /> Firma Digital Capturada:
                  </Typography>
                  <Box
                    component="img"
                    src={record.signature_data}
                    alt="Firma del cliente"
                    sx={{
                      maxHeight: 80,
                      maxWidth: 240,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 1.5,
                      p: 1,
                      border: '1px dashed rgba(255, 255, 255, 0.2)',
                    }}
                  />
                </Box>
              )}

              {/* Attachments / Evidences Section */}
              {attachments.length > 0 && (
                <>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
                  <Typography variant="subtitle2" sx={{ color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <AttachFileIcon sx={{ fontSize: 18 }} /> Evidencias y Archivos Adjuntos ({attachments.length}):
                  </Typography>

                  <Grid container spacing={2}>
                    {attachments.map((att) => {
                      const fileUrl = getAttachmentUrl(att.url);
                      const isImg =
                        att.content_type?.includes('image') ||
                        att.original_name?.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|bmp)$/);
                      const isPdf =
                        att.content_type?.includes('pdf') ||
                        att.original_name?.toLowerCase().endsWith('.pdf');
                      const isExcel =
                        att.content_type?.includes('excel') ||
                        att.original_name?.toLowerCase().match(/\.(xlsx|xls|csv)$/);

                      return (
                        <Grid item xs={12} sm={6} md={4} key={att.id || att.filename}>
                          <Card
                            sx={{
                              p: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              backgroundColor: 'rgba(7, 11, 20, 0.7)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: 2,
                            }}
                          >
                            {/* Icon or Thumbnail */}
                            {isImg ? (
                              <Box
                                component="img"
                                src={fileUrl}
                                alt={att.original_name}
                                onClick={() => setPreviewPhoto({ url: fileUrl, title: att.original_name })}
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 1.5,
                                  objectFit: 'cover',
                                  cursor: 'pointer',
                                  border: '1px solid rgba(56, 189, 248, 0.4)',
                                  transition: 'transform 0.2s',
                                  '&:hover': { transform: 'scale(1.05)' },
                                }}
                              />
                            ) : isPdf ? (
                              <Box
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 1.5,
                                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                  color: '#ef4444',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                }}
                              >
                                <PictureAsPdfIcon sx={{ fontSize: 26 }} />
                              </Box>
                            ) : isExcel ? (
                              <Box
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 1.5,
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                  color: '#10b981',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                }}
                              >
                                <TableChartIcon sx={{ fontSize: 26 }} />
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 1.5,
                                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                                  color: '#38bdf8',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid rgba(56, 189, 248, 0.3)',
                                }}
                              >
                                <AttachFileIcon sx={{ fontSize: 26 }} />
                              </Box>
                            )}

                            {/* Details & Actions */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}
                                title={att.original_name}
                              >
                                {att.original_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                {formatFileSize(att.size)}
                              </Typography>
                            </Box>

                            <Tooltip title={isImg ? 'Ver foto ampliada' : 'Descargar archivo'}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  if (isImg) {
                                    setPreviewPhoto({ url: fileUrl, title: att.original_name });
                                  } else {
                                    window.open(fileUrl, '_blank');
                                  }
                                }}
                                sx={{ color: '#38bdf8' }}
                              >
                                {isImg ? <VisibilityIcon fontSize="small" /> : <OpenInNewIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* Lightbox Dialog for Image Previews */}
      {previewPhoto && (
        <Dialog
          open={Boolean(previewPhoto)}
          onClose={() => setPreviewPhoto(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: '#0f172a',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Typography variant="subtitle1" sx={{ color: '#f8fafc', fontWeight: 700 }} noWrap>
              📷 {previewPhoto.title}
            </Typography>
            <IconButton onClick={() => setPreviewPhoto(null)} sx={{ color: '#94a3b8' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <DialogContent sx={{ textAlign: 'center', p: 2, backgroundColor: '#070b14' }}>
            <Box
              component="img"
              src={previewPhoto.url}
              alt={previewPhoto.title}
              sx={{
                maxWidth: '100%',
                maxHeight: '75vh',
                borderRadius: 2,
                objectFit: 'contain',
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default function HistorySection({ currentUser }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const isAdmin = currentUser.role === 'admin';

  const loadRecordsData = async (start = startDate, end = endDate) => {
    setLoading(true);
    try {
      const data = await getRecords(
        isAdmin ? null : currentUser.username,
        start || null,
        end || null
      );
      setRecords(data);
    } catch (err) {
      setToast({ open: true, message: err.message || 'Error al cargar registros', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecordsData();
  }, [currentUser]);

  const handleApplyFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      setToast({
        open: true,
        message: 'La fecha de inicio no puede ser posterior a la fecha de fin.',
        severity: 'warning',
      });
      return;
    }
    loadRecordsData(startDate, endDate);
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    loadRecordsData('', '');
  };

  const filteredRecords = records.filter(
    (r) =>
      r.solicitud_num?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.created_by?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 4, sm: 6 }, px: { xs: 1.5, sm: 3 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: { xs: 2, sm: 3 } }}>
        {/* Header and Top Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <HistoryIcon sx={{ color: '#38bdf8', fontSize: { xs: 28, sm: 32 } }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                Historial de Solicitudes y Actividades
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                {isAdmin
                  ? 'Visualización general de planillas cargadas con filtros por rango de fecha y reportes NetUno'
                  : `Planillas cargadas por el técnico: ${currentUser.name}`}
              </Typography>
            </Box>
          </Box>

          {/* Export Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {/* Relación NetUno Button */}
            <Tooltip
              title={
                startDate && endDate
                  ? `Generar sábana consolidada NetUno del ${startDate} al ${endDate} con fórmulas oficiales de IVA 16%, ISLR 2% y Ret. IVA 75%`
                  : 'Generar sábana consolidada NetUno con todas las planillas cargadas (o aplique filtros de fecha para un período específico)'
              }
            >
              <span>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#0369a1' },
                  }}
                  startIcon={<AssessmentIcon />}
                  onClick={() => downloadNetunoRelacionExcel(startDate || null, endDate || null, isAdmin ? null : currentUser.username)}
                  disabled={records.length === 0}
                >
                  Relación NetUno (Excel)
                </Button>
              </span>
            </Tooltip>

            {/* General Excel Export */}
            <Tooltip title="Exportar listado completo de planillas y actividades a Excel">
              <span>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => downloadRecordsExcel(isAdmin ? null : currentUser.username, null, startDate || null, endDate || null)}
                  disabled={records.length === 0}
                  sx={{ fontWeight: 700, textTransform: 'none' }}
                >
                  Reporte General (Excel)
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Search & Date Filter Panel */}
        <Box
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2.5,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Quick Search */}
          <Box sx={{ flex: '1 1 280px', minWidth: 240 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por Nro. de Solicitud, Cliente o Técnico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />,
              }}
            />
          </Box>

          {/* Date Range: Fecha Inicio & Fecha Fin */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              label="Fecha Inicio"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 155 }}
            />

            <TextField
              label="Fecha Fin"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 155 }}
            />

            <Button
              variant="contained"
              size="medium"
              startIcon={<FilterAltIcon />}
              onClick={handleApplyFilter}
              sx={{
                backgroundColor: '#0ea5e9',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#0284c7' },
              }}
            >
              Filtrar Fechas
            </Button>

            {(startDate || endDate) && (
              <Button
                variant="outlined"
                size="medium"
                startIcon={<RestartAltIcon />}
                onClick={handleClearFilter}
                sx={{
                  color: '#94a3b8',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  textTransform: 'none',
                  '&:hover': { borderColor: '#ef4444', color: '#ef4444' },
                }}
              >
                Limpiar Fechas
              </Button>
            )}
          </Box>
        </Box>

        {/* Active Filter Indicator Badge */}
        {(startDate || endDate) && (
          <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<CalendarMonthIcon sx={{ color: '#38bdf8 !important' }} />}
              label={`Período filtrado: ${startDate ? `Desde ${startDate}` : 'Desde el inicio'} ${endDate ? `hasta ${endDate}` : 'hasta hoy'} — Mostrando ${filteredRecords.length} planilla(s)`}
              onDelete={handleClearFilter}
              sx={{
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            />
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredRecords.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: '#94a3b8' }}>
              No se encontraron registros de actividades.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'rgba(56, 189, 248, 0.1)' }}>
                <TableRow>
                  <TableCell style={{ width: '40px' }} />
                  <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>SOLICITUD</TableCell>
                  <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>CLIENTE / RAZÓN SOCIAL</TableCell>
                  <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>TÉCNICO</TableCell>
                  <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>FECHA / HORA</TableCell>
                  <TableCell align="center" sx={{ color: '#38bdf8', fontWeight: 700 }}>REPORTES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.map((rec) => (
                  <RecordRow key={rec.id} record={rec} isAdmin={isAdmin} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Snackbar
          open={toast.open}
          autoHideDuration={6000}
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={toast.severity} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}
