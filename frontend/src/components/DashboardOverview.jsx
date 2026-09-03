import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  CircularProgress,
  Divider,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import RouterIcon from '@mui/icons-material/Router';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import RefreshIcon from '@mui/icons-material/Refresh';

import { getRecords, downloadRecordsExcel, openRecordPdf } from '../services/api';

export default function DashboardOverview({ currentUser, onNavigate }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getRecords();
      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching records in dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute live metrics from actual records
  const totalRecords = records.length;
  let totalFiberMeters = 0;
  let totalConnectors = 0;
  let totalRosetas = 0;
  let totalONTs = 0;
  let executedActivitiesCount = 0;

  records.forEach((rec) => {
    if (rec.activities && Array.isArray(rec.activities)) {
      rec.activities.forEach((act) => {
        if (act.checked) {
          executedActivitiesCount++;
          const name = (act.name || '').toLowerCase();
          const desc = (act.description || '').toLowerCase();
          const qty = parseFloat(act.unid_mts) || 0;

          if (name.includes('fibra') || desc.includes('fibra')) {
            totalFiberMeters += qty;
          } else if (name.includes('conector') || desc.includes('conector')) {
            totalConnectors += qty || 1;
          } else if (name.includes('roseta') || desc.includes('roseta')) {
            totalRosetas += qty || 1;
          } else if (name.includes('ont') || desc.includes('ont')) {
            totalONTs += qty || 1;
          }
        }
      });
    }
  });

  const recentRecords = records.slice(0, 4);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 2 }}>
      {/* Top Banner Subtitle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.3px' }}>
            Panel de Operaciones LNet
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Control en tiempo real de actividades, telecomunicaciones y despliegue de fibra óptica
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: 16, color: '#10b981 !important' }} />}
            label="Servidor En Línea"
            size="small"
            sx={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontWeight: 600,
            }}
          />
          <Tooltip title="Actualizar métricas">
            <IconButton
              size="small"
              onClick={loadData}
              sx={{
                color: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                '&:hover': { backgroundColor: 'rgba(56, 189, 248, 0.2)' },
              }}
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Grid Layout matching user's crypto/fintech dashboard reference */}
      <Grid container spacing={3}>
        {/* Left Column: Technician Card & Quick KPIs */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Glowing Technician Card (matching "VISA" card from reference) */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #0f2744 0%, #0369a1 45%, #0284c7 100%)',
                boxShadow: '0 20px 40px -15px rgba(2, 132, 199, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                minHeight: 220,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Background decorative circles */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Card Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img src="/favicon.svg" alt="LNet" style={{ width: 26, height: 26 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: 1 }}>
                    LNet
                  </Typography>
                </Box>
                <Chip
                  label="EN SERVICIO"
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    letterSpacing: 0.5,
                    backdropFilter: 'blur(4px)',
                  }}
                />
              </Box>

              {/* Card Center: Clean Operations & FTTH Badge */}
              <Box sx={{ my: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 28,
                      borderRadius: 1.2,
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 0 4px rgba(255,255,255,0.2)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 22,
                        height: 16,
                        borderRadius: 0.6,
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                      }}
                    />
                  </Box>
                  <WifiTetheringIcon sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 22 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    color: '#ffffff',
                    fontFamily: '"Outfit", "Roboto", sans-serif',
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    lineHeight: 1.2,
                  }}
                >
                  Operaciones
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)', letterSpacing: 0.5 }}>

                </Typography>
              </Box>

              {/* Card Footer: Technician Name & Role */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    Técnico Titular
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    {currentUser.name}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    Rol Asignado
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#ffffff', textTransform: 'capitalize' }}>
                    {currentUser.role === 'admin' ? 'Administrador' : 'Instalador'}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Quick Action Pill Buttons below card */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AssignmentIcon />}
                onClick={() => onNavigate('form')}
                sx={{
                  py: 1.3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                  color: '#070b14',
                  fontWeight: 700,
                  boxShadow: '0 8px 25px rgba(56, 189, 248, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
                    color: '#ffffff',
                  },
                }}
              >
                Nueva Planilla
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<HistoryIcon />}
                onClick={() => onNavigate('history')}
                sx={{
                  py: 1.3,
                  borderRadius: 3,
                  color: '#38bdf8',
                  borderColor: 'rgba(56, 189, 248, 0.4)',
                  backgroundColor: 'rgba(56, 189, 248, 0.05)',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  },
                }}
              >
                Historial
              </Button>
            </Box>

            {/* Quick Stats Panel (matching "Cryptocurrencies Prices" box) */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                backgroundColor: '#101726',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2 }}>
                Resumen Rápido de Solicitudes
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Metric Item 1 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: 2, backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                      <AssignmentIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#f8fafc' }}>
                        Solicitudes Totales
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Planillas registradas
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#38bdf8' }}>
                    {totalRecords}
                  </Typography>
                </Box>

                {/* Metric Item 2 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: 2, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      <WifiTetheringIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#f8fafc' }}>
                        Metros de Fibra
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Desplegados en campo
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
                    {totalFiberMeters.toLocaleString()} m
                  </Typography>
                </Box>

                {/* Metric Item 3 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: 2, backgroundColor: 'rgba(129, 140, 248, 0.15)', color: '#818cf8' }}>
                      <CheckCircleIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#f8fafc' }}>
                        Actividades Realizadas
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Items ejecutados
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#818cf8' }}>
                    {executedActivitiesCount}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Grid>

        {/* Right Column: Hero Metrics & Recent Activity */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Big Hero Card (matching main candlestick / chart card from reference) */}
            <Paper
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 4,
                backgroundColor: '#101726',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Volumen Total de Despliegue de Red
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffffff', mt: 0.5 }}>
                    {totalFiberMeters.toLocaleString()}{' '}
                    <Typography component="span" variant="h6" sx={{ color: '#38bdf8', fontWeight: 600 }}>
                      Mts de Fibra
                    </Typography>
                  </Typography>
                </Box>

                <Chip
                  icon={<TrendingUpIcon sx={{ fontSize: 16, color: '#38bdf8 !important' }} />}
                  label="100% Eficiencia Operativa"
                  sx={{
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    fontWeight: 600,
                  }}
                />
              </Box>

              {/* Material Bars / Analytics Breakdown */}
              <Typography variant="subtitle2" sx={{ color: '#cbd5e1', fontWeight: 600, mb: 2 }}>
                Distribución de Materiales Principales Instalados:
              </Typography>

              <Grid container spacing={2.5}>
                {/* Fiber Meter Bar */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, borderRadius: 3, backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        Fibra Óptica (Tendido)
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#38bdf8' }}>
                        {totalFiberMeters} Mts
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (totalFiberMeters / 1000) * 100 || 20)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                        },
                      }}
                    />
                  </Box>
                </Grid>

                {/* Rosetas Opticas */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, borderRadius: 3, backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        Rosetas Ópticas FTTX
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>
                        {totalRosetas} Unid.
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (totalRosetas / 20) * 100 || 15)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                        },
                      }}
                    />
                  </Box>
                </Grid>

                {/* Conectores Mecanicos */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, borderRadius: 3, backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        Conectores Mecánicos SC-APC
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#818cf8' }}>
                        {totalConnectors} Unid.
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (totalConnectors / 30) * 100 || 25)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)',
                        },
                      }}
                    />
                  </Box>
                </Grid>

                {/* Equipos ONT */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, borderRadius: 3, backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        Equipos ONT Instalados
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                        {totalONTs} Unid.
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (totalONTs / 10) * 100 || 30)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)',
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Bottom Card: Recent Solicituds Table (matching "Your Assets" from reference) */}
            <Paper
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 4,
                backgroundColor: '#101726',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    Últimas Solicitudes Registradas
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Actividades más recientes ingresadas en el sistema
                  </Typography>
                </Box>

                <Button
                  size="small"
                  endIcon={<ArrowForwardIosIcon sx={{ fontSize: '12px !important' }} />}
                  onClick={() => onNavigate('history')}
                  sx={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Ver Todo
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} sx={{ color: '#38bdf8' }} />
                </Box>
              ) : recentRecords.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 3 }}>
                  No hay solicitudes registradas aún. Haz clic en "Nueva Planilla" para comenzar.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {recentRecords.map((rec) => (
                    <Box
                      key={rec.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(56, 189, 248, 0.05)',
                          borderColor: 'rgba(56, 189, 248, 0.25)',
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2.5,
                            backgroundColor: 'rgba(56, 189, 248, 0.12)',
                            color: '#38bdf8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          #{rec.solicitud_num?.slice(-3) || '001'}
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                            {rec.client_name || 'Sin nombre de cliente'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            Solicitud #{rec.solicitud_num} • Por: {rec.created_by}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Chip
                          label={rec.email_status && rec.email_status.includes('Enviado') ? 'Correo Enviado' : 'Registrado'}
                          size="small"
                          sx={{
                            backgroundColor:
                              rec.email_status && rec.email_status.includes('Enviado')
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(148, 163, 184, 0.15)',
                            color:
                              rec.email_status && rec.email_status.includes('Enviado') ? '#34d399' : '#94a3b8',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />

                        <Tooltip title="Ver Documento PDF">
                          <IconButton
                            size="small"
                            onClick={() => openRecordPdf(rec.id)}
                            sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
                          >
                            <PictureAsPdfIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
