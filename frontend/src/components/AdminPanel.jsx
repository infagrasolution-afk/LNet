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
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import KeyResetIcon from '@mui/icons-material/VpnKey';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import {
  getUsers,
  createUser,
  updateUserStatus,
  updateUserRole,
  resetPassword,
  deleteUser,
  getSettings,
  saveSettings,
  testEmailConnection,
  downloadRecordsExcel,
} from '../services/api';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [settings, setSettingsData] = useState({ gmail_user: '', gmail_app_password: '', default_recipients: '' });
  const [selectedExportUser, setSelectedExportUser] = useState('ALL');

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);

  // New User Dialog State
  const [openNewUserModal, setOpenNewUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserCedula, setNewUserCedula] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');

  // Test Email Dialog State
  const [openTestEmailModal, setOpenTestEmailModal] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const loadData = async () => {
    setLoadingUsers(true);
    try {
      const usersData = await getUsers();
      setUsers(usersData);
      const settingsData = await getSettings();
      setSettingsData(settingsData);
    } catch (err) {
      setToast({ open: true, message: err.message || 'Error al cargar datos del panel', severity: 'error' });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'activo' ? 'bloqueado' : 'activo';
    try {
      await updateUserStatus(user.username, newStatus);
      setToast({
        open: true,
        message: `Usuario ${user.username} ${newStatus === 'bloqueado' ? 'bloqueado' : 'desbloqueado'} con éxito.`,
        severity: 'info',
      });
      loadData();
    } catch (err) {
      setToast({ open: true, message: err.message || 'Error al actualizar estado', severity: 'error' });
    }
  };

  const handleRoleChange = async (user, newRole) => {
    try {
      const res = await updateUserRole(user.username, newRole);
      setToast({
        open: true,
        message: res.message || `Rol de ${user.name} cambiado a ${newRole}`,
        severity: 'success',
      });
      setUsers(users.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
    } catch (err) {
      setToast({ open: true, message: err.message || 'Error al actualizar el rol', severity: 'error' });
    }
  };

  const handleResetPassword = async (user) => {
    if (window.confirm(`¿Desea restablecer la contraseña de ${user.name} a su número de cédula (${user.cedula})?`)) {
      try {
        const res = await resetPassword(user.username);
        setToast({ open: true, message: res.message, severity: 'success' });
      } catch (err) {
        setToast({ open: true, message: err.message, severity: 'error' });
      }
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`¿Está seguro de eliminar al usuario ${user.name} (${user.username})?`)) {
      try {
        const res = await deleteUser(user.username);
        setToast({ open: true, message: res.message, severity: 'success' });
        loadData();
      } catch (err) {
        setToast({ open: true, message: err.message, severity: 'error' });
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserCedula.trim()) {
      setToast({ open: true, message: 'El nombre y cédula son obligatorios.', severity: 'error' });
      return;
    }

    try {
      const res = await createUser({
        name: newUserName.trim(),
        cedula: newUserCedula.trim(),
        username: newUserUsername.trim() || undefined,
        role: newUserRole,
      });

      setToast({ open: true, message: res.message, severity: 'success' });
      setOpenNewUserModal(false);
      setNewUserName('');
      setNewUserCedula('');
      setNewUserUsername('');
      setNewUserRole('user');
      loadData();
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoadingSettings(true);
    try {
      const res = await saveSettings(settings);
      setToast({ open: true, message: res.message, severity: 'success' });
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testRecipient.trim()) {
      setToast({ open: true, message: 'Ingrese un correo de prueba.', severity: 'error' });
      return;
    }

    setSendingTestEmail(true);
    try {
      const res = await testEmailConnection(testRecipient.trim());
      setToast({ open: true, message: res.message, severity: 'success' });
      setOpenTestEmailModal(false);
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    } finally {
      setSendingTestEmail(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 4, sm: 6 }, px: { xs: 1.5, sm: 3 } }}>
      {/* User Management Section */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: { xs: 2, sm: 3 }, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AdminPanelSettingsIcon sx={{ color: '#38bdf8', fontSize: { xs: 28, sm: 32 } }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                Gestión de Usuarios del Sistema
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Administrar permisos, crear usuarios y bloquear / desbloquear accesos
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenNewUserModal(true)}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Crear Nuevo Usuario
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loadingUsers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#38bdf8' }} />
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflowX: 'auto', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
            <Table size="medium" sx={{ minWidth: 600 }}>
              <TableHead sx={{ backgroundColor: 'rgba(56, 189, 248, 0.12)', borderBottom: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <TableRow>
                  <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>Nombre y Apellido</TableCell>
                  <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>Usuario</TableCell>
                  <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>Cédula</TableCell>
                  <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>Rol</TableCell>
                  <TableCell align="center" sx={{ color: '#38bdf8', fontWeight: 700 }}>
                    Estado
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#38bdf8', fontWeight: 700 }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => {
                  const isBlocked = u.status === 'bloqueado';
                  return (
                    <TableRow key={u.id} hover>
                      <TableCell fontWeight="500">{u.name}</TableCell>
                      <TableCell>
                        <code>{u.username}</code>
                      </TableCell>
                      <TableCell>{u.cedula}</TableCell>
                      <TableCell>
                        {u.username.toLowerCase() === 'linfante' ? (
                          <Chip
                            label="Admin Principal"
                            color="secondary"
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        ) : (
                          <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                            <Select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u, e.target.value)}
                              sx={{
                                color: u.role === 'admin' ? '#a5b4fc' : '#38bdf8',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                '&:before': { borderBottomColor: 'rgba(255,255,255,0.15)' },
                                '&:hover:not(.Mui-disabled):before': { borderBottomColor: '#38bdf8' },
                              }}
                            >
                              <MenuItem value="user">Usuario (Técnico)</MenuItem>
                              <MenuItem value="admin">Administrador</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={isBlocked ? 'Bloqueado' : 'Activo'}
                          color={isBlocked ? 'error' : 'success'}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {u.username.toLowerCase() !== 'linfante' && (
                          <>
                            <Tooltip title={isBlocked ? 'Desbloquear Usuario' : 'Bloquear Usuario'}>
                              <IconButton
                                color={isBlocked ? 'success' : 'warning'}
                                onClick={() => handleToggleStatus(u)}
                              >
                                {isBlocked ? <LockOpenIcon /> : <LockIcon />}
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Restablecer Contraseña (Cédula)">
                              <IconButton color="info" onClick={() => handleResetPassword(u)}>
                                <KeyResetIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar Usuario">
                              <IconButton color="error" onClick={() => handleDeleteUser(u)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Gmail Email SMTP Configuration Section */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
          <EmailIcon sx={{ color: '#38bdf8', fontSize: 32 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc' }}>
              Configuración del Servicio de Correo Gmail
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Establezca las credenciales remitentes de Gmail para el envío automático de reportes
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSaveSettings}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Correo Remitente de Gmail"
                placeholder="ejemplo@gmail.com"
                value={settings.gmail_user}
                onChange={(e) => setSettingsData({ ...settings, gmail_user: e.target.value })}
                helperText="Dirección de la cuenta de Gmail utilizada para enviar correos"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="Contraseña de Aplicación (Gmail App Password)"
                placeholder="•••• •••• •••• ••••"
                value={settings.gmail_app_password}
                onChange={(e) => setSettingsData({ ...settings, gmail_app_password: e.target.value })}
                helperText="Generada en Google Account > Seguridad > Contraseñas de aplicación"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Correos Destinatarios Predeterminados (Separados por coma)"
                placeholder="supervisor@netuno.net, contraloria@netuno.net"
                value={settings.default_recipients}
                onChange={(e) => setSettingsData({ ...settings, default_recipients: e.target.value })}
                helperText="Destinatarios automáticos si el usuario no especifica uno en el formulario"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="info"
              startIcon={<CheckCircleIcon />}
              onClick={() => setOpenTestEmailModal(true)}
            >
              Probar Conexión Gmail
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loadingSettings}
            >
              {loadingSettings ? <CircularProgress size={24} color="inherit" /> : 'Guardar Configuración'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Modal: Create User */}
      <Dialog open={openNewUserModal} onClose={() => setOpenNewUserModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Crear Nuevo Usuario</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              label="Nombre y Apellido"
              placeholder="Ej: Pedro Pérez"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
            />
            <TextField
              required
              fullWidth
              label="Número de Cédula"
              placeholder="Ej: 20123456"
              value={newUserCedula}
              onChange={(e) => setNewUserCedula(e.target.value)}
            />
            <TextField
              fullWidth
              label="Usuario (Opcional - Autogenerado si se omite)"
              placeholder="Ej: pperez"
              value={newUserUsername}
              onChange={(e) => setNewUserUsername(e.target.value)}
              helperText="Por defecto: Inicial del nombre + Apellido"
            />
            <FormControl fullWidth>
              <InputLabel>Rol del Usuario</InputLabel>
              <Select
                value={newUserRole}
                label="Rol del Usuario"
                onChange={(e) => setNewUserRole(e.target.value)}
              >
                <MenuItem value="user">Usuario Estándar</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenNewUserModal(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleCreateUser}>
            Crear Usuario
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Test Email Connection */}
      <Dialog open={openTestEmailModal} onClose={() => setOpenTestEmailModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Prueba de Conexión Gmail</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
            Ingrese una dirección de correo donde recibir el mensaje de prueba:
          </Typography>
          <TextField
            autoFocus
            fullWidth
            type="email"
            label="Correo de Destino"
            placeholder="su_correo@gmail.com"
            value={testRecipient}
            onChange={(e) => setTestRecipient(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenTestEmailModal(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSendTestEmail} disabled={sendingTestEmail}>
            {sendingTestEmail ? <CircularProgress size={24} color="inherit" /> : 'Enviar Correo Prueba'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Section 2: Data Export & Downloads for Administrator */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: { xs: 2, sm: 3 }, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <FileDownloadIcon color="primary" sx={{ fontSize: { xs: 28, sm: 32 } }} />
          <Box>
            <Typography variant="h5" color="primary.dark" fontWeight="bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              Descarga y Exportación de Información Guardada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Exportar las planillas y registros de actividades guardados por los usuarios en formato Excel o PDF
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Seleccionar Usuario a Exportar</InputLabel>
              <Select
                value={selectedExportUser}
                label="Seleccionar Usuario a Exportar"
                onChange={(e) => setSelectedExportUser(e.target.value)}
              >
                <MenuItem value="ALL">-- Todos los Usuarios (Reporte Master) --</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.username}>
                    {u.name} ({u.username})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={8}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<FileDownloadIcon />}
                onClick={() => {
                  const target = selectedExportUser === 'ALL' ? null : selectedExportUser;
                  downloadRecordsExcel(target);
                  setToast({ open: true, message: 'Generando reporte en Excel (.csv)...', severity: 'info' });
                }}
                sx={{ fontWeight: 'bold' }}
              >
                Descargar en Excel (.csv)
              </Button>
            </Box>
          </Grid>
        </Grid>
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
