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

import { getRecords, downloadRecordsExcel, openRecordPdf, getAttachmentUrl } from '../services/api';

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
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Tooltip title="Descargar esta planilla en formato Excel (.csv)">
              <Button
                variant="outlined"
                size="small"
                color="success"
                startIcon={<FileDownloadIcon />}
                onClick={() => downloadRecordsExcel(null, record.id)}
              >
                Excel
              </Button>
            </Tooltip>

            <Tooltip title="Ver / Imprimir Reporte PDF de esta planilla">
              <Button
                variant="outlined"
                size="small"
                color="primary"
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
                              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                                {formatFileSize(att.size)}
                              </Typography>
                            </Box>

                            <Tooltip title={isImg ? 'Ver foto ampliada' : 'Abrir / Descargar archivo'}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  if (isImg) {
                                    setPreviewPhoto({ url: fileUrl, title: att.original_name });
                                  } else {
                                    window.open(fileUrl, '_blank');
                                  }
                                }}
                                sx={{
                                  color: '#38bdf8',
                                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                  '&:hover': { backgroundColor: 'rgba(56, 189, 248, 0.25)' },
                                }}
                              >
                                {isImg ? <VisibilityIcon sx={{ fontSize: 18 }} /> : <OpenInNewIcon sx={{ fontSize: 18 }} />}
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

      {/* Lightbox Modal for Photo Preview */}
      {previewPhoto && (
        <Dialog
          open={Boolean(previewPhoto)}
          onClose={() => setPreviewPhoto(null)}
          maxWidth="md"
          PaperProps={{
            sx: {
              backgroundColor: '#0f172a',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              overflow: 'hidden',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
              {previewPhoto.title}
            </Typography>
            <IconButton onClick={() => setPreviewPhoto(null)} sx={{ color: '#94a3b8' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <DialogContent sx={{ p: 1, display: 'flex', justifyContent: 'center', backgroundColor: '#000000' }}>
            <img
              src={previewPhoto.url}
              alt={previewPhoto.title}
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }}
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
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const isAdmin = currentUser?.role === 'admin';

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Regular user sees only their records; Admin sees all records
      const targetUser = isAdmin ? null : currentUser.username;
      const data = await getRecords(targetUser);
      setRecords(data);
    } catch (err) {
      setToast({ open: true, message: err.message || 'Error al cargar el historial', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [currentUser]);

  const handleExportExcel = () => {
    try {
      const targetUser = isAdmin ? null : currentUser.username;
      downloadRecordsExcel(targetUser);
      setToast({ open: true, message: 'Descargando reporte en formato Excel (.csv)...', severity: 'info' });
    } catch (err) {
      setToast({ open: true, message: 'Error al descargar archivo Excel', severity: 'error' });
    }
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <HistoryIcon sx={{ color: '#38bdf8', fontSize: { xs: 28, sm: 32 } }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                Historial de Solicitudes Registradas
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                {isAdmin
                  ? 'Visualización global de solicitudes y descarga de reportes'
                  : 'Registros generados por tu usuario'}
              </Typography>
            </Box>
          </Box>

          <TextField
            size="small"
            placeholder="Buscar por Nro, Cliente o Usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />,
            }}
            sx={{ width: { xs: '100%', sm: 280 } }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#38bdf8' }} />
          </Box>
        ) : filteredRecords.length === 0 ? (
          <Alert severity="info" sx={{ py: 2, backgroundColor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
            No se encontraron registros de solicitudes.
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflowX: 'auto', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: 'rgba(56, 189, 248, 0.12)', borderBottom: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <TableRow>
                  <TableCell sx={{ width: '40px' }} />
                  <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>Nro. Solicitud</TableCell>
                  <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>Cliente / Razón Social</TableCell>
                  <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>Registrado Por</TableCell>
                  <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>Fecha / Hora</TableCell>
                  <TableCell align="center" sx={{ color: '#38bdf8', fontWeight: 700 }}>
                    Reportes
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.map((r) => (
                  <RecordRow key={r.id} record={r} isAdmin={isAdmin} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Toast Notification */}
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
    </Container>
  );
}
