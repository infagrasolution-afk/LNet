import React, { useState, useRef, useEffect } from 'react';
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
  Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import BuildIcon from '@mui/icons-material/Build';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RestorePageIcon from '@mui/icons-material/RestorePage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import CameraCaptureModal from './CameraCaptureModal';
import SignaturePad from './SignaturePad';
import { compressImage } from '../utils/imageCompressor';

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

const DRAFT_STORAGE_KEY = 'lnet_form_draft';

export default function FormSection({ currentUser, onSaveRecord }) {
  const [solicitudNum, setSolicitudNum] = useState('');
  const [solicitudError, setSolicitudError] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientNameError, setClientNameError] = useState('');
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [observations, setObservations] = useState('');

  // GPS Geolocation state
  const [gpsLocation, setGpsLocation] = useState(null);
  const [capturingGps, setCapturingGps] = useState(false);

  // Digital Signature state
  const [signatureData, setSignatureData] = useState(null);

  // Attachments & Camera state
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Draft banner state
  const [draftFound, setDraftFound] = useState(null);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Check for saved local draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.solicitudNum || parsed.clientName || parsed.observations) {
          setDraftFound(parsed);
        }
      }
    } catch (e) {
      console.warn('Error reading form draft:', e);
    }
  }, []);

  // Auto-save form draft to localStorage
  useEffect(() => {
    if (solicitudNum || clientName || observations) {
      const draft = {
        solicitudNum,
        clientName,
        observations,
        activities,
        gpsLocation,
        signatureData,
        timestamp: Date.now(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
  }, [solicitudNum, clientName, observations, activities, gpsLocation, signatureData]);

  const handleRestoreDraft = () => {
    if (!draftFound) return;
    setSolicitudNum(draftFound.solicitudNum || '');
    setClientName(draftFound.clientName || '');
    setObservations(draftFound.observations || '');
    if (draftFound.activities) setActivities(draftFound.activities);
    if (draftFound.gpsLocation) setGpsLocation(draftFound.gpsLocation);
    if (draftFound.signatureData) setSignatureData(draftFound.signatureData);
    setDraftFound(null);
    setToast({ open: true, message: 'Borrador restaurado con éxito.', severity: 'info' });
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraftFound(null);
  };

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

  // GPS Geolocation Handler
  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setToast({
        open: true,
        message: 'La geolocalización no es soportada por este navegador.',
        severity: 'error',
      });
      return;
    }

    setCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        const accuracy = parseFloat(position.coords.accuracy.toFixed(1));

        setGpsLocation({ lat, lng, accuracy });
        setCapturingGps(false);
        setToast({
          open: true,
          message: `Ubicación GPS capturada con éxito (±${accuracy}m)`,
          severity: 'success',
        });
      },
      (error) => {
        setCapturingGps(false);
        let msg = 'Error al obtener la ubicación GPS.';
        if (error.code === 1) msg = 'Permiso de ubicación denegado por el usuario o navegador.';
        else if (error.code === 2) msg = 'Ubicación no disponible en este momento.';
        else if (error.code === 3) msg = 'Tiempo de espera agotado al obtener GPS.';
        setToast({ open: true, message: msg, severity: 'warning' });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Process selected files with automatic compression
  const handleFilesSelected = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setCompressing(true);
    const newItems = [];

    for (const file of Array.from(files)) {
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

      // Comprimir imágenes automáticamente si es tipo image
      let processedFile = file;
      if (fileType === 'image') {
        try {
          processedFile = await compressImage(file);
        } catch (e) {
          console.warn('Error compressing image:', e);
        }
      }

      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file: processedFile,
        name: processedFile.name,
        size: processedFile.size,
        originalSize: file.size,
        type: fileType,
        previewUrl: fileType === 'image' ? URL.createObjectURL(processedFile) : null,
      });
    }

    setAttachedFiles((prev) => [...prev, ...newItems]);
    setCompressing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add photo captured from camera modal with compression
  const handlePhotoCaptured = async (file) => {
    setCompressing(true);
    let processedFile = file;
    try {
      processedFile = await compressImage(file);
    } catch (e) {
      console.warn('Error compressing camera photo:', e);
    }

    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      file: processedFile,
      name: processedFile.name,
      size: processedFile.size,
      originalSize: file.size,
      type: 'image',
      previewUrl: URL.createObjectURL(processedFile),
    };

    setAttachedFiles((prev) => [...prev, newItem]);
    setCompressing(false);
    setToast({
      open: true,
      message: 'Fotografía optimizada y adjuntada exitosamente.',
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
    if (!bytes) return '0 B';
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
        gps_lat: gpsLocation ? gpsLocation.lat : null,
        gps_lng: gpsLocation ? gpsLocation.lng : null,
        gps_accuracy: gpsLocation ? gpsLocation.accuracy : null,
        signature_data: signatureData || null,
      };

      const filesToUpload = attachedFiles.map((a) => a.file);
      const res = await onSaveRecord(payload, filesToUpload);

      setToast({
        open: true,
        message: res.message || 'Planilla y registro guardados exitosamente.',
        severity: 'success',
      });

      // Limpiar borrador local
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      // Cleanup object URLs and reset form
      attachedFiles.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      setAttachedFiles([]);
      setSolicitudNum('');
      setClientName('');
      setObservations('');
      setGpsLocation(null);
      setSignatureData(null);
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
      {/* Draft restoration alert */}
      {draftFound && (
        <Alert
          severity="info"
          icon={<RestorePageIcon />}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" size="small" variant="outlined" onClick={handleRestoreDraft}>
                Restaurar
              </Button>
              <Button color="inherit" size="small" onClick={handleDiscardDraft}>
                Descartar
              </Button>
            </Box>
          }
          sx={{ mb: 3, borderRadius: 2 }}
        >
          Se encontró un borrador guardado en este dispositivo (Solicitud #{draftFound.solicitudNum || 'S/N'} - {draftFound.clientName || 'Sin cliente'}).
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
          <BuildIcon sx={{ color: '#38bdf8', fontSize: { xs: 28, sm: 32 } }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              Formulario de Carga: Ejecución de Actividades
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Registre la solicitud, materiales utilizados, ubicación GPS, fotos y firma digital
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Header Section: Solicitud, Cliente & GPS */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
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

        {/* GPS Geolocation Banner Card */}
        <Box
          sx={{
            mb: 4,
            p: 2,
            borderRadius: 2.5,
            backgroundColor: gpsLocation ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.4)',
            border: gpsLocation ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: gpsLocation ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: gpsLocation ? '#10b981' : '#38bdf8',
              }}
            >
              <LocationOnIcon />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                Ubicación GPS en Terreno
              </Typography>
              {gpsLocation ? (
                <Typography variant="body2" sx={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 16 }} /> Coordenadas: {gpsLocation.lat}, {gpsLocation.lng} (±{gpsLocation.accuracy}m)
                </Typography>
              ) : (
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Registre las coordenadas exactas de la instalación para el reporte oficial
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {gpsLocation && (
              <Button
                size="small"
                variant="outlined"
                color="success"
                startIcon={<OpenInNewIcon />}
                href={`https://maps.google.com/?q=${gpsLocation.lat},${gpsLocation.lng}`}
                target="_blank"
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Ver en Google Maps
              </Button>
            )}

            <Button
              variant={gpsLocation ? 'outlined' : 'contained'}
              color="primary"
              size="small"
              startIcon={capturingGps ? <CircularProgress size={16} color="inherit" /> : <MyLocationIcon />}
              onClick={handleCaptureGps}
              disabled={capturingGps}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                py: 0.8,
              }}
            >
              {capturingGps ? 'Capturando GPS...' : gpsLocation ? 'Actualizar GPS' : 'Capturar Ubicación GPS'}
            </Button>
          </Box>
        </Box>

        {/* Section 2: Execution of Activities Table */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#38bdf8' }}>
          EJECUCIÓN DE ACTIVIDADES Y MATERIALES
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

        {/* Section 4: Digital Signature Canvas */}
        <Box sx={{ mb: 4 }}>
          <SignaturePad
            onSignatureChange={setSignatureData}
            initialSignature={signatureData}
          />
        </Box>

        {/* Section 5: Attachments and Camera Capture */}
        <Box sx={{ mb: 4, p: { xs: 2, sm: 3 }, borderRadius: 3, backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachFileIcon /> Evidencias y Archivos Adjuntos
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Cargue documentos PDF, planillas Excel o fotografías (las imágenes se optimizan automáticamente)
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
                startIcon={compressing ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                disabled={compressing}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                sx={{
                  borderRadius: 2,
                  borderColor: 'rgba(56, 189, 248, 0.4)',
                  backgroundColor: 'rgba(56, 189, 248, 0.08)',
                  color: '#38bdf8',
                }}
              >
                {compressing ? 'Procesando...' : 'Cargar Archivo (PDF, Excel, Foto)'}
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
                        {item.originalSize && item.originalSize > item.size && (
                          <span style={{ color: '#10b981', marginLeft: '4px' }}>
                            (Optimizado)
                          </span>
                        )}
                      </Typography>
                    </Box>

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
            disabled={loading || compressing}
            onClick={() => handleSave()}
            sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: 260, py: 1.3, fontWeight: 700 }}
          >
            {loading ? <CircularProgress size={26} color="inherit" /> : 'Guardar Registro y Descontar Stock'}
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
