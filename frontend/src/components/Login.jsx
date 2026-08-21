import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Grid,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const SAVED_CREDS_KEY = 'lnet_remembered_credentials';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_CREDS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.username && parsed.password) {
          setUsername(parsed.username);
          setPassword(parsed.password);
          setRememberMe(true);
        }
      }
    } catch (e) {
      console.error('Error loading saved credentials', e);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Por favor ingrese su usuario y contraseña.');
      return;
    }

    setLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem(SAVED_CREDS_KEY, JSON.stringify({ username, password }));
      } else {
        localStorage.removeItem(SAVED_CREDS_KEY);
      }

      await onLoginSuccess(username.trim(), password.trim());
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <Container maxWidth="xs" sx={{ mt: { xs: 4, sm: 8 }, mb: 4, px: { xs: 2, sm: 0 } }}>
      <Paper elevation={4} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, textAlign: 'center' }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            margin: '0 auto 16px auto',
          }}
        >
          <img src="/favicon.svg" alt="LNet Logo" style={{ width: '100%', height: '100%' }} />
        </Box>

        <Typography variant="h5" component="h1" gutterBottom color="primary.dark">
          Sistema LNet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Módulo de Seguridad y Gestión de Actividades
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Usuario (Inicial Nombre + Apellido)"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña (Cédula)"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <FormControlLabel
            control={
              <Checkbox
                value="remember"
                color="primary"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            }
            label="Recordar usuario y contraseña"
            sx={{ display: 'block', textAlign: 'left', mt: 1 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.2, fontSize: '1rem' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Acceso Rápido de Prueba
          </Typography>
        </Divider>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Haz clic en cualquier usuario para auto-completar:
        </Typography>

        <Grid container spacing={1} justifyContent="center">
          <Grid item>
            <Chip
              icon={<AdminPanelSettingsIcon />}
              label="Admin (Luis Infante)"
              color="primary"
              variant="outlined"
              size="small"
              onClick={() => handleQuickSelect('linfante', '18829227')}
              sx={{ cursor: 'pointer', fontWeight: 600 }}
            />
          </Grid>
          <Grid item>
            <Chip
              icon={<PersonIcon />}
              label="Julio Durán"
              size="small"
              onClick={() => handleQuickSelect('jduran', '23950926')}
              sx={{ cursor: 'pointer' }}
            />
          </Grid>
          <Grid item>
            <Chip
              icon={<PersonIcon />}
              label="Anthony Vivas"
              size="small"
              onClick={() => handleQuickSelect('avivas', '19452382')}
              sx={{ cursor: 'pointer' }}
            />
          </Grid>
          <Grid item>
            <Chip
              icon={<PersonIcon />}
              label="Daniel Castro"
              size="small"
              onClick={() => handleQuickSelect('dcastro', '16544357')}
              sx={{ cursor: 'pointer' }}
            />
          </Grid>
          <Grid item>
            <Chip
              icon={<PersonIcon />}
              label="Jefferson Rivas"
              size="small"
              onClick={() => handleQuickSelect('jrivas', '11691433')}
              sx={{ cursor: 'pointer' }}
            />
          </Grid>
          <Grid item>
            <Chip
              icon={<PersonIcon />}
              label="Luis Betancourt"
              size="small"
              onClick={() => handleQuickSelect('lbetancourt', '18816670')}
              sx={{ cursor: 'pointer' }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
