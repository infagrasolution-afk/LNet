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
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { getRecords, downloadRecordsExcel, openRecordPdf, getInventory } from '../services/api';

export default function DashboardOverview({ currentUser, onNavigate }) {
  const [records, setRecords] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser?.role === 'admin';

  const loadData = async () => {
    setLoading(true);
    try {
      const recordsData = await getRecords();
      setRecords(recordsData || []);
      if (isAdmin) {
        const inventoryData = await getInventory();
        setInventory(inventoryData || []);
      }
    } catch (err) {
      console.error('Error fetching records in dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

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

  const lowStockCount = inventory.filter((i) => i.stock <= i.min_stock).length;
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
            Control en tiempo real de actividades, telecomunicaciones, GPS e inventario centralizado
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: 16, color: '#10b981 !important' }} />}
            label="Servidor SQLite WAL En Línea"
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

      {/* Main Grid Layout */}
      <Grid container spacing={3}>
        {/* Left Column: Technician Card & Quick KPIs & Inventory widget */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Glowing Technician Card */}
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

              {/* Card Center: Technician Profile Info */}
              <Box sx={{ my: 3, position: 'relative', zIndex: 1 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  TÉCNICO EN SESIÓN
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', mt: 0.5 }}>
                  {currentUser?.name || 'Técnico de Campo'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', fontFamily: 'monospace' }}>
                  C.I. V-{currentUser?.cedula || 'N/A'} • Rol: {currentUser?.role === 'admin' ? 'Administrador' : 'Técnico de Campo'}
                </Typography>
              </Box>

              {/* Card Footer: Quick action */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                  {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => onNavigate('form')}
                  sx={{
                    backgroundColor: '#ffffff',
                    color: '#0369a1',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                  }}
                >
                  + Cargar Planilla
                </Button>
              </Box>
            </Paper>

            {/* Quick KPI Summary Card */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2 }}>
                Resumen Rápido de Solicitudes
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Solicitudes */}
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

                {/* Metros Fibra */}
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

                {/* Actividades */}
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

            {/* Inventory Quick Widget for Admins */}
            {isAdmin && (
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InventoryIcon sx={{ color: '#38bdf8', fontSize: 20 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                      Inventario Central
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    onClick={() => onNavigate('inventory')}
                    sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                  >
                    Ver Todo ↗
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, backgroundColor: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                      Catálogo
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#38bdf8' }}>
                      {inventory.length} <span style={{ fontSize: '0.75rem' }}>items</span>
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, backgroundColor: lowStockCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.08)', border: lowStockCount > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <Typography variant="caption" sx={{ color: lowStockCount > 0 ? '#ef4444' : '#10b981', display: 'block' }}>
                      Alertas Stock
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: lowStockCount > 0 ? '#ef4444' : '#10b981' }}>
                      {lowStockCount} <span style={{ fontSize: '0.75rem' }}>{lowStockCount > 0 ? 'Bajo' : 'Óptimo'}</span>
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>
        </Grid>

        {/* Right Column: Hero Metrics & Recent Activity */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Big Hero Card */}
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
                        {totalRosetas} Unid
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, totalRosetas * 5 || 15)}
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
                        Conectores SC-APC
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                        {totalConnectors} Unid
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, totalConnectors * 3 || 25)}
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

                {/* Equipos ONT */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, borderRadius: 3, backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        Equipos ONT Instalados
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#818cf8' }}>
                        {totalONTs} Unid
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, totalONTs * 10 || 10)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Recent Solicitudes / Activity Table */}
            <Paper
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 4,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                  Últimas Solicitudes Registradas
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />}
                  onClick={() => onNavigate('history')}
                  sx={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.8rem' }}
                >
                  Ver Historial Completo
                </Button>
              </Box>

              {recentRecords.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    No hay solicitudes registradas aún. Haga clic en <strong>+ Cargar Planilla</strong> para comenzar.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {recentRecords.map((rec) => {
                    const acts = rec.activities ? rec.activities.filter((a) => a.checked) : [];
                    return (
                      <Box
                        key={rec.id}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          backgroundColor: 'rgba(7, 11, 20, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 1.5,
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: 'rgba(56, 189, 248, 0.05)',
                            borderColor: 'rgba(56, 189, 248, 0.2)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip
                            label={`#${rec.solicitud_num}`}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(56, 189, 248, 0.12)',
                              color: '#38bdf8',
                              fontWeight: 700,
                              fontFamily: 'monospace',
                            }}
                          />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#f8fafc' }}>
                              {rec.client_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              Técnico: {rec.created_by} • {rec.created_at} • {acts.length} actividades
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Descargar Excel">
                            <IconButton
                              size="small"
                              onClick={() => downloadRecordsExcel(null, rec.id)}
                              sx={{ color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                            >
                              <FileDownloadIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Ver PDF Oficial">
                            <IconButton
                              size="small"
                              onClick={() => openRecordPdf(rec.id, false)}
                              sx={{ color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}
                            >
                              <PictureAsPdfIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
