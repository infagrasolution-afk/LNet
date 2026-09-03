import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  InputBase,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  IconButton,
  Fade,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const SAVED_CREDS_KEY = 'lnet_remembered_credentials';

export default function Login({ onLoginSuccess, sessionMessage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        backgroundImage: "url('/images/anime-city-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow & subtle vignette */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at top, rgba(14, 28, 64, 0.25) 0%, rgba(7, 13, 30, 0.45) 60%, rgba(3, 7, 18, 0.75) 100%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top Navbar: Clean Brand Logo */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          px: { xs: 2.5, sm: 6, md: 8 },
          py: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/favicon.svg"
            alt="LNet Logo"
            sx={{
              width: 34,
              height: 34,
              filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.6))',
            }}
          />
          <Typography
            variant="h5"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              letterSpacing: 1.5,
              textShadow: '0 2px 10px rgba(0,0,0,0.7)',
              fontFamily: '"Outfit", "Roboto", sans-serif',
            }}
          >
            LNet
          </Typography>
        </Box>
      </Box>

      {/* Center Section: Floating Glassmorphism Modal */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: 2,
          py: 3,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: 'rgba(15, 30, 55, 0.42)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '24px',
            boxShadow:
              '0 25px 50px -12px rgba(0, 0, 0, 0.65), 0 0 35px rgba(56, 189, 248, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.08)',
            p: { xs: 3.5, sm: 4.5 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top-Right Close Button */}
          <IconButton
            size="small"
            onClick={() => setError(null)}
            sx={{
              position: 'absolute',
              top: 18,
              right: 18,
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(6px)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Modal Header: "Login" */}
          <Typography
            variant="h4"
            component="h1"
            align="center"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              fontSize: { xs: '1.85rem', sm: '2.1rem' },
              letterSpacing: 0.5,
              mb: 3.5,
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            Login
          </Typography>

          {/* Inactivity / Session Message */}
          {sessionMessage && (
            <Fade in={!!sessionMessage}>
              <Alert
                severity="warning"
                sx={{
                  mb: 2.5,
                  backgroundColor: 'rgba(217, 119, 6, 0.88)',
                  color: '#ffffff',
                  borderRadius: 2,
                  backdropFilter: 'blur(8px)',
                  '& .MuiAlert-icon': { color: '#ffffff' },
                }}
              >
                {sessionMessage}
              </Alert>
            </Fade>
          )}

          {/* Error Message */}
          {error && (
            <Fade in={!!error}>
              <Alert
                severity="error"
                sx={{
                  mb: 2.5,
                  backgroundColor: 'rgba(220, 38, 38, 0.85)',
                  color: '#ffffff',
                  borderRadius: 2,
                  backdropFilter: 'blur(8px)',
                  '& .MuiAlert-icon': { color: '#ffffff' },
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Input 1: Usuario / Email */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '0.85rem',
                  display: 'block',
                  mb: 0.5,
                }}
              >
                Usuario
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
                  pb: 0.6,
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                  '&:focus-within': {
                    borderBottom: '2px solid #ffffff',
                    boxShadow: '0 2px 10px rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                <InputBase
                  fullWidth
                  id="username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  placeholder="ej: linfante"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{
                    color: '#ffffff',
                    fontSize: '1rem',
                    '& input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.5)',
                      opacity: 1,
                    },
                  }}
                />
                <MailOutlineIcon sx={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: 20, ml: 1 }} />
              </Box>
            </Box>

            {/* Input 2: Password */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '0.85rem',
                  display: 'block',
                  mb: 0.5,
                }}
              >
                Contraseña
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
                  pb: 0.6,
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                  '&:focus-within': {
                    borderBottom: '2px solid #ffffff',
                    boxShadow: '0 2px 10px rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                <InputBase
                  fullWidth
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                    color: '#ffffff',
                    fontSize: '1rem',
                    letterSpacing: showPassword ? 'normal' : 2,
                    '& input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.5)',
                      opacity: 1,
                      letterSpacing: 'normal',
                    },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{ color: 'rgba(255, 255, 255, 0.75)', p: 0.5 }}
                >
                  {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                </IconButton>
                <LockOutlinedIcon sx={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: 20, ml: 0.5 }} />
              </Box>
            </Box>

            {/* Row: Remember me & Help */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                flexWrap: 'wrap',
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.65)',
                      p: 0.5,
                      '&.Mui-checked': {
                        color: '#ffffff',
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.8rem', userSelect: 'none' }}
                  >
                    Recordarme
                  </Typography>
                }
              />

              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': {
                    color: '#ffffff',
                    textDecoration: 'underline',
                  },
                }}
              >
                ¿Olvidó contraseña?
              </Typography>
            </Box>

            {/* Pill Submit Button */}
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                height: 46,
                borderRadius: '24px',
                backgroundColor: 'rgba(15, 23, 42, 0.88)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                textTransform: 'none',
                fontSize: '1.05rem',
                fontWeight: 600,
                letterSpacing: 0.5,
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  backgroundColor: 'rgba(30, 41, 59, 0.96)',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.6)',
                  transform: 'translateY(-1.5px)',
                },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#ffffff' }} /> : 'Login'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Bottom Footer Note */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          pb: 2,
          px: 2,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.75)',
            letterSpacing: 0.5,
            fontSize: '0.78rem',
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            display: 'block',
          }}
        >
          Sistema de Gestión LNet • Red de Telecomunicaciones & Actividades
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
            letterSpacing: 0.6,
            fontSize: '0.72rem',
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            display: 'block',
            mt: 0.3,
          }}
        >
          Elaborado por Infagrasolution
        </Typography>
      </Box>
    </Box>
  );
}
