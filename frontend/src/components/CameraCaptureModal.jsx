import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

export default function CameraCaptureModal({ open, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);

  // Stop camera media stream
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Start camera with requested constraints
  const startCamera = async (mode = facingMode) => {
    stopStream();
    setLoading(true);
    setCameraError(null);
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Su navegador o dispositivo no soporta acceso directo a la cámara.');
      setLoading(false);
      return;
    }

    try {
      // Constraints prioritizing high resolution and requested facingMode
      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          'Permiso de cámara denegado. Por favor habilite el permiso de la cámara en la barra de direcciones de su navegador para tomar fotografías.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No se encontró ninguna cámara conectada en este dispositivo.');
      } else {
        setCameraError(`No se pudo inicializar la cámara: ${err.message || 'Error desconocido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedPhotoUrl(null);
      setCapturedBlob(null);
      setCameraError(null);
    }
    return () => {
      stopStream();
    };
  }, [open]);

  // Connect stream to video element once loaded
  useEffect(() => {
    if (stream && videoRef.current && !capturedPhotoUrl) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, capturedPhotoUrl]);

  // Toggle between front and back cameras
  const handleToggleCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // Capture snapshot from video to canvas
  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    // If front camera, flip horizontally for mirror preview effect
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const photoUrl = URL.createObjectURL(blob);
          setCapturedPhotoUrl(photoUrl);
          setCapturedBlob(blob);
          // Pause camera stream while reviewing photo
          if (stream) {
            stream.getTracks().forEach((track) => (track.enabled = false));
          }
        }
      },
      'image/jpeg',
      0.92
    );
  };

  // Retake photo
  const handleRetake = () => {
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
    }
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
    // Re-enable stream tracks
    if (stream) {
      stream.getTracks().forEach((track) => (track.enabled = true));
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } else {
      startCamera(facingMode);
    }
  };

  // Accept and pass captured file
  const handleConfirmPhoto = () => {
    if (!capturedBlob) return;

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 14);
    const fileName = `foto_evidencia_${timestamp}.jpg`;
    const file = new File([capturedBlob], fileName, { type: 'image/jpeg' });

    onCapture(file);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    stopStream();
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
    }
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          px: 3,
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PhotoCameraIcon sx={{ color: '#38bdf8', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', fontSize: '1.1rem' }}>
            {capturedPhotoUrl ? 'Confirmar Fotografía' : 'Tomar Foto de Evidencia'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleCloseModal} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2, backgroundColor: '#070b14', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Hidden canvas for snapshot rasterization */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Error message */}
        {cameraError && (
          <Box sx={{ width: '100%', my: 2 }}>
            <Alert
              severity="error"
              icon={<VideocamOffIcon />}
              sx={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                '& .MuiAlert-icon': { color: '#ef4444' },
              }}
            >
              {cameraError}
            </Alert>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button variant="outlined" color="primary" onClick={() => startCamera(facingMode)}>
                Reintentar Acceso
              </Button>
            </Box>
          </Box>
        )}

        {/* Loading Spinner */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
            <CircularProgress sx={{ color: '#38bdf8' }} />
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Solicitando permiso y activando cámara...
            </Typography>
          </Box>
        )}

        {/* Live Video / Captured Photo Container */}
        {!cameraError && !loading && (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 500,
              aspectRatio: '4/3',
              backgroundColor: '#000000',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {capturedPhotoUrl ? (
              <img
                src={capturedPhotoUrl}
                alt="Captura de evidencia"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                }}
              />
            )}

            {/* Switch Camera Button Overlay */}
            {!capturedPhotoUrl && (
              <Tooltip title="Cambiar Cámara (Frontal / Trasera)">
                <IconButton
                  onClick={handleToggleCamera}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': { backgroundColor: 'rgba(56, 189, 248, 0.4)' },
                  }}
                >
                  <FlipCameraIosIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button onClick={handleCloseModal} sx={{ color: '#94a3b8' }}>
          Cancelar
        </Button>

        {capturedPhotoUrl ? (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ReplayIcon />}
              onClick={handleRetake}
              sx={{ borderColor: 'rgba(255, 255, 255, 0.3)', color: '#ffffff' }}
            >
              Repetir
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleConfirmPhoto}
              sx={{ fontWeight: 700 }}
            >
              Usar Foto
            </Button>
          </Box>
        ) : (
          !cameraError &&
          !loading && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<PhotoCameraIcon />}
              onClick={handleTakePhoto}
              sx={{
                borderRadius: '24px',
                px: 3.5,
                py: 1,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                color: '#070b14',
                boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
                  color: '#ffffff',
                },
              }}
            >
              Tomar Foto
            </Button>
          )
        )}
      </DialogActions>
    </Dialog>
  );
}
