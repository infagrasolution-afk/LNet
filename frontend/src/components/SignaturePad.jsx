import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Tooltip,
} from '@mui/material';
import DrawIcon from '@mui/icons-material/Draw';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function SignaturePad({ onSignatureChange, initialSignature = null }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(Boolean(initialSignature));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Configurar canvas con ratio de píxeles del dispositivo (Retina/High-DPI)
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Si hay firma previa, renderizarla
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = initialSignature;
    }
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault(); // Evita scroll en pantallas táctiles
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Exportar data URL de la firma
    const canvas = canvasRef.current;
    if (canvas && onSignatureChange) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
    if (onSignatureChange) {
      onSignatureChange(null);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <DrawIcon sx={{ fontSize: 18 }} /> Firma de Conformidad del Cliente / Técnico
        </Typography>

        {hasDrawn && (
          <Button
            size="small"
            variant="text"
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={handleClear}
            sx={{ fontSize: '0.8rem', textTransform: 'none' }}
          >
            Limpiar Firma
          </Button>
        )}
      </Box>

      <Paper
        variant="outlined"
        sx={{
          position: 'relative',
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          borderColor: hasDrawn ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.12)',
          borderRadius: 2,
          overflow: 'hidden',
          touchAction: 'none', // Permite dibujar en smartphones sin scroll accidental
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '140px',
            display: 'block',
            cursor: 'crosshair',
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {!hasDrawn && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              textAlign: 'center',
              opacity: 0.45,
            }}
          >
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
              ✍️ Firme aquí con el dedo, lápiz o mouse
            </Typography>
          </Box>
        )}

        {/* Línea guía inferior */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 24,
            left: '10%',
            right: '10%',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            pointerEvents: 'none',
          }}
        />
      </Paper>
    </Box>
  );
}
