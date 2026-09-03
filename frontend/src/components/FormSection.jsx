import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BuildIcon from '@mui/icons-material/Build';

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

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');

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

      const res = await onSaveRecord(payload);
      
      setToast({
        open: true,
        message: 'Solicitud y registro de actividades guardados exitosamente',
        severity: 'success',
      });

      // Reset form
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
              Registre la solicitud y seleccione los materiales/actividades ejecutados
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
              {activities.map((row, index) => (
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
        <Typography variant="h6" color="primary.main" sx={{ mb: 1, fontWeight: 600 }}>
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

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={loading}
            onClick={() => handleSave()}
            sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: 220, py: 1.2 }}
          >
            {loading ? <CircularProgress size={26} color="inherit" /> : 'Guardar Registro'}
          </Button>
        </Box>

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
