import React, { useState, useRef } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  Card,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BuildIcon from '@mui/icons-material/Build';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import ImageIcon from '@mui/icons-material/Image';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import CameraCaptureModal from './CameraCaptureModal';

const INITIAL_ACTIVITIES = [
  {
    id: 'act-1',
    name: 'Fibra Óptica',
    description: 'Fibra Óptica (1H C/guía Negro / 1H S/guía Negro / 1H S/Blanco / 1H Anti roedores / 4H Redondo)',
    type: 'select',
    selectOptions: [
      '1H C/guía Negro',
      '1H S/guía Negro',
      '1H S/Blanco',
      '1H Anti roedores',
      '4H Redondo',
    ],
    detail: '1H C/guía Negro',
    checked: false,
    unid_mts: '',
  },
  {
    id: 'act-2',
    name: 'ROSETA OPTICA FTTX 2-PTU',
    description: 'INV-200-0069 | ROSETA OPTICA FTTX 2-PTU',
    checked: false,
    unid_mts: '',
  },
  {
    id: 'act-3',
    name: 'CONECTOR MECANICO SC-APC',
    description: 'INV-200-0030 | CONECTOR MECANICO SC-APC',
    checked: false,
    unid_mts: '',
  },
  {
    id: 'act-4',
    name: 'PATCH CORD FIBRA SM SIMPLEX SC-APC / SC-UPC 1.5MT',
    description: 'INV-400-0135 | PATCH CORD FIBRA SM SIMPLEX SC-APC / SC-UPC 1.5MT',
    checked: false,
    unid_mts: '',
  },
  {
    id: 'act-5',
    name: 'TENSOR FIBRA DROP S/GANCHO TIPO-S',
    description: 'INV-300-0059 | TENSOR FIBRA DROP S/GANCHO TIPO-S',
    checked: false,
    unid_mts: '',
  },
  {
    id: 'act-6',
    name: 'GANCHO DE FIJACION TIPO-S',
    description: 'INV-300-0031 | GANCHO DE FIJACION TIPO-S',
    checked: false,
    unid_mts: '',
  },
  {
    id: 'act-7',
    name: 'PATCH CORD UTP RJ-45 CAT5E 1MT',
    description: 'INV-400-0157 | PATCH CORD UTP RJ-45 CAT5E 1MT',
    checked: false,
    unid_mts: '',
  },
  {
    id: 'act-8',
    name: 'ETIQUETA SERIALIZADA',
    description: 'INV-300-0028 | ETIQUETA SERIALIZADA',
    checked: false,
    unid_mts: '',
  },
  {
    id: 'act-9',
    name: 'Equipo ONT',
    description: 'INV-100-0047 | Equipo ONT',
    checked: false,
    unid_mts: '',
  },
  {
    id: 'act-10',
    name: 'TUBERIA METALICA CORRUGADA',
    description: 'TUBERIA METALICA CORRUGADA (Indicar diámetro)',
    type: 'input_detail',
    detail: '',
    detailPlaceholder: 'Indicar diámetro...',
    checked: false,
    unid_mts: '',
  },
  {
    id: 'act-11',
    name: 'TUBERIA PLASTICA CORRUGADA',
    description: 'TUBERIA PLASTICA CORRUGADA (Indicar diámetro)',
    type: 'input_detail',
    detail: '',
    detailPlaceholder: 'Indicar diámetro...',
    checked: false,
    unid_mts: '',
  },
  {
    id: 'act-12',
    name: 'Otro (Indique y Detalle 1)',
    description: 'Otro (Indique y Detalle)',
    type: 'input_detail',
    detail: '',
    detailPlaceholder: 'Especifique el material u otro trabajo...',
    checked: false,
    unid_mts: '',
  },
  {
    id: 'act-13',
    name: 'Otro (Indique y Detalle 2)',
    description: 'Otro (Indique y Detalle)',
    type: 'input_detail',
    detail: '',
    detailPlaceholder: 'Especifique el material u otro trabajo...',
    checked: false,
    unid_mts: '',
  },
];

export default function FormSection({ currentUser, onSaveRecord }) {
  const [solicitudNum, setSolicitudNum] = useState('');
  const [solicitudError, setSolicitudError] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientNameError, setClientNameError] = useState('');
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [observations, setObservations] = useState('');

  // Attachments & Camera state
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const handleSolicitudChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setSolicitudNum(val);
      setSolicitudError('');
    } else {
      setSolicitudError('Solo se permiten caracteres numéricos en el Nro. de Solicitud');
    }
  };

  const handleToggleActivity = (id) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === id ? { ...act, checked: !act.checked } : act))
    );
  };

  const handleUnidChange = (id, val) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === id ? { ...act, unid_mts: val } : act))
    );
  };

  const handleDetailChange = (id, val) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === id ? { ...act, detail: val } : act))
    );
  };

  // Process selected files (PDF, Excel, Images)
  const handleFilesSelected = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newItems = Array.from(files).map((file) => {
      let fileType = 'other';
      if (file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
        fileType = 'pdf';
      } else if (
        file.type.includes('image') ||
        file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|bmp)$/)
      ) {
        fileType = 'image';
      } else if (
        file.type.includes('excel') ||
        file.type.includes('spreadsheet') ||
        file.name.toLowerCase().match(/\.(xlsx|xls|csv)$/)
      ) {
        fileType = 'excel';
      }

      return {
        id: Math.random().toString(36).substring(2, 9),
        file: file,
        name: file.name,
        size: file.size,
        type: fileType,
        previewUrl: fileType === 'image' ? URL.createObjectURL(file) : null,
      };
    });

    setAttachedFiles((prev) => [...prev, ...newItems]);
    // Reset file input value so selecting the same file again triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add photo captured from camera modal
  const handlePhotoCaptured = (file) => {
    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      file: file,
      name: file.name,
      size: file.size,
      type: 'image',
      previewUrl: URL.createObjectURL(file),
    };
    setAttachedFiles((prev) => [...prev, newItem]);
    setToast({
      open: true,
      message: 'Fotografía capturada y adjuntada exitosamente',
      severity: 'success',
    });
  };

  // Remove attached file
  const handleRemoveAttachedFile = (id) => {
    setAttachedFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateForm = () => {
    let isValid = true;
    let errorMsg = '';

    if (!solicitudNum.trim() || !/^\d+$/.test(solicitudNum.trim())) {
      setSolicitudError('Debe ingresar un Nro. de Solicitud válido (solo números).');
      errorMsg = 'Debe ingresar un Nro. de Solicitud válido (solo números).';
      isValid = false;
    } else {
      setSolicitudError('');
    }

    if (!clientName.trim()) {
      setClientNameError('Debe ingresar el Nombre / Razón Social.');
      if (!errorMsg) errorMsg = 'Debe ingresar el Nombre / Razón Social.';
      isValid = false;
    } else {
      setClientNameError('');
    }

    if (!isValid) {
      setToast({
        open: true,
        message: errorMsg || 'Por favor complete los campos obligatorios.',
        severity: 'warning',
      });
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        solicitud_num: solicitudNum.trim(),
        client_name: clientName.trim(),
        activities: activities,
        observations: observations.trim(),
        created_by: currentUser.username,
        send_email: false,
      };

      const filesToUpload = attachedFiles.map((a) => a.file);
      const res = await onSaveRecord(payload, filesToUpload);

      setToast({
        open: true,
        message:
          res.message || 'Solicitud y registro de actividades guardados exitosamente.',
        severity: 'success',
      });

      // Cleanup object URLs and reset form
      attachedFiles.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      setAttachedFiles([]);
      setSolicitudNum('');
      setClientName('');
      setObservations('');
      setActivities(INITIAL_ACTIVITIES);
    } catch (err) {
      setToast({
        open: true,
        message: err.message || 'Error al guardar el registro',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 4, sm: 6 }, px: { xs: 1.5, sm: 3 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
          <BuildIcon sx={{ color: '#38bdf8', fontSize: { xs: 28, sm: 32 } }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              Formulario de Carga: Ejecución de Actividades
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Registre la solicitud, seleccione materiales y adjunte evidencias o fotografías
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Header Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              required
              fullWidth
              id="solicitud_num"
              label="Nro. Solicitud (Solo Números)"
              variant="outlined"
              value={solicitudNum}
              onChange={handleSolicitudChange}
              error={Boolean(solicitudError)}
              helperText={solicitudError || 'Ej: 2421299'}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              required
              fullWidth
              id="client_name"
              label="Nombre / Razón Social"
              variant="outlined"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                if (e.target.value.trim()) setClientNameError('');
              }}
              error={Boolean(clientNameError)}
              helperText={clientNameError || 'Ej: PERFUMES FACTORY, C.A.'}
            />
          </Grid>
        </Grid>

        {/* Section 2: Execution of Activities Table */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#38bdf8' }}>
          EJECUCIÓN DE ACTIVIDADES
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, borderRadius: 3, overflowX: 'auto', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
          <Table size="small" sx={{ minWidth: 550 }}>
            <TableHead sx={{ backgroundColor: 'rgba(56, 189, 248, 0.12)', borderBottom: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <TableRow>
                <TableCell align="center" sx={{ color: '#38bdf8', fontWeight: 700, width: '60px' }}>
                  Marcar
                </TableCell>
                <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>
                  CODIGO SAP / MATERIAL UTILIZADO
                </TableCell>
                <TableCell align="center" sx={{ color: '#38bdf8', fontWeight: 700, width: '180px' }}>
                  Unid / MTS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    backgroundColor: row.checked ? 'rgba(2, 136, 209, 0.05)' : 'inherit',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <TableCell align="center">
                    <Checkbox
                      checked={row.checked}
                      onChange={() => handleToggleActivity(row.id)}
                      color="primary"
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight={row.checked ? 600 : 400}>
                      {row.description}
                    </Typography>

                    {/* Sub-selector for Fiber */}
                    {row.type === 'select' && row.checked && (
                      <FormControl size="small" sx={{ mt: 1, minWidth: 240, width: '100%' }}>
                        <InputLabel>Tipo de Fibra Óptica</InputLabel>
                        <Select
                          value={row.detail}
                          label="Tipo de Fibra Óptica"
                          onChange={(e) => handleDetailChange(row.id, e.target.value)}
                        >
                          {row.selectOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    {/* Input detail for tubes or "Otro" */}
                    {row.type === 'input_detail' && (
                      <TextField
                        size="small"
                        placeholder={row.detailPlaceholder}
                        value={row.detail}
                        onChange={(e) => handleDetailChange(row.id, e.target.value)}
                        sx={{ mt: 1, maxWidth: 360, width: '100%', display: 'block' }}
                      />
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <TextField
                      size="small"
                      placeholder="Ej: 1, 220"
                      value={row.unid_mts}
                      onChange={(e) => handleUnidChange(row.id, e.target.value)}
                      disabled={!row.checked}
                      sx={{ width: '100px' }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Section 3: Observations */}
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#38bdf8' }}>
          DETALLES Y OBSERVACIONES
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="Ingrese comentarios, observaciones técnicas o detalles adicionales de la ejecución..."
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          sx={{ mb: 4 }}
        />

        {/* Section 4: Attachments and Camera Capture */}
        <Box sx={{ mb: 4, p: { xs: 2, sm: 3 }, borderRadius: 3, backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachFileIcon /> Evidencias y Archivos Adjuntos
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Puede cargar documentos PDF, planillas Excel o capturar fotografías desde la cámara del dispositivo
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls,.csv,image/*"
                style={{ display: 'none' }}
                onChange={handleFilesSelected}
              />

              <Button
                variant="outlined"
                color="primary"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                sx={{
                  borderRadius: 2,
                  borderColor: 'rgba(56, 189, 248, 0.4)',
                  backgroundColor: 'rgba(56, 189, 248, 0.08)',
                  color: '#38bdf8',
                  '&:hover': {
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.18)',
                  },
                }}
              >
                Cargar Archivo (PDF, Excel, Foto)
              </Button>

              <Button
                variant="contained"
                startIcon={<PhotoCameraIcon />}
                onClick={() => setCameraModalOpen(true)}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                  color: '#070b14',
                  fontWeight: 700,
                  boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
                    color: '#ffffff',
                  },
                }}
              >
                Tomar Foto
              </Button>
            </Box>
          </Box>

          {/* Attached Files List / Grid */}
          {attachedFiles.length === 0 ? (
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: 2,
                backgroundColor: 'rgba(7, 11, 20, 0.3)',
              }}
            >
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                No hay archivos ni fotografías adjuntas. Haga clic en <strong>Cargar Archivo</strong> o <strong>Tomar Foto</strong> para agregar evidencias.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {attachedFiles.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 2,
                      position: 'relative',
                    }}
                  >
                    {/* Thumbnail or Icon */}
                    {item.type === 'image' && item.previewUrl ? (
                      <Box
                        component="img"
                        src={item.previewUrl}
                        alt={item.name}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                          objectFit: 'cover',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                        }}
                      />
                    ) : item.type === 'pdf' ? (
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
                    ) : item.type === 'excel' ? (
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

                    {/* File Information */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}
                        title={item.name}
                      >
                        {item.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        {formatFileSize(item.size)} • {item.type.toUpperCase()}
                      </Typography>
                    </Box>

                    {/* Delete button */}
                    <Tooltip title="Eliminar archivo">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveAttachedFile(item.id)}
                        sx={{
                          color: '#94a3b8',
                          '&:hover': { color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)' },
                        }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={loading}
            onClick={() => handleSave()}
            sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: 240, py: 1.3, fontWeight: 700 }}
          >
            {loading ? <CircularProgress size={26} color="inherit" /> : 'Guardar Registro y Evidencias'}
          </Button>
        </Box>

        {/* Camera Capture Modal */}
        <CameraCaptureModal
          open={cameraModalOpen}
          onClose={() => setCameraModalOpen(false)}
          onCapture={handlePhotoCaptured}
        />

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
      </Paper>
    </Container>
  );
}

