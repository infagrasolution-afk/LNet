import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider,
  Badge,
  Popover,
  Card,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';

import { getNotifications, markNotificationsRead } from '../services/api';
import {
  requestNotificationPermission,
  showDeviceNotification,
  getNotificationPermission,
} from '../services/notifications';

export default function Navbar({ currentUser, activeTab, setActiveTab, onLogout }) {
  const isAdmin = currentUser?.role === 'admin';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [liveToast, setLiveToast] = useState({ open: false, title: '', message: '' });
  const knownNotifIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setDrawerOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon sx={{ fontSize: 18 }} /> },
    { id: 'form', label: 'Planilla', icon: <AssignmentIcon sx={{ fontSize: 18 }} /> },
    { id: 'history', label: 'Historial', icon: <HistoryIcon sx={{ fontSize: 18 }} /> },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Administración',
      icon: <AdminPanelSettingsIcon sx={{ fontSize: 18 }} />,
    });
  }

  // Fetch and poll notifications for administrators
  const fetchNotificationsData = async () => {
    if (!isAdmin) return;
    try {
      const data = await getNotifications();
      const notifsList = Array.isArray(data) ? data : [];
      setNotifications(notifsList);

      // Check for new incoming notifications
      if (isInitialLoadRef.current) {
        notifsList.forEach((n) => knownNotifIdsRef.current.add(n.id));
        isInitialLoadRef.current = false;
      } else {
        // Detect fresh notifications
        const freshNotifs = notifsList.filter((n) => !knownNotifIdsRef.current.has(n.id));
        if (freshNotifs.length > 0) {
          freshNotifs.forEach((n) => {
            knownNotifIdsRef.current.add(n.id);
            // Trigger device native notification if not created by current user
            if (n.created_by !== currentUser?.username) {
              showDeviceNotification(`LNet: Solicitud #${n.solicitud_num}`, {
                body: n.message,
                tag: n.id,
              }, () => {
                setActiveTab('history');
              });

              // Also show in-app floating banner
              setLiveToast({
                open: true,
                title: n.title || `Nueva Solicitud #${n.solicitud_num}`,
                message: n.message,
              });
            }
          });
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Check notification permission on mount for admins
  useEffect(() => {
    if (isAdmin) {
      fetchNotificationsData();
      const timer = setInterval(fetchNotificationsData, 10000); // Poll every 10 seconds

      // If browser supports notifications and permission is default, prompt user
      if (getNotificationPermission() === 'default') {
        const hasPrompted = sessionStorage.getItem('lnet_notif_prompted');
        if (!hasPrompted) {
          setPermissionModalOpen(true);
          sessionStorage.setItem('lnet_notif_prompted', 'true');
        }
      }

      return () => clearInterval(timer);
    }
  }, [isAdmin, currentUser]);

  // Compute unread count for current administrator
  const unreadCount = notifications.filter(
    (n) => !n.read_by || !n.read_by.map((u) => u.toLowerCase()).includes(currentUser?.username?.toLowerCase())
  ).length;

  const handleOpenNotifications = (event) => {
    setAnchorElNotif(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorElNotif(null);
  };

  const handleNotificationClick = async (item) => {
    handleCloseNotifications();
    try {
      await markNotificationsRead(currentUser.username, item.id);
      // Mark as read locally
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === item.id
            ? { ...n, read_by: [...(n.read_by || []), currentUser.username] }
            : n
        )
      );
    } catch (e) {
      console.error(e);
    }
    setActiveTab('history');
  };

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead(currentUser.username, null, true);
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read_by: [...(n.read_by || []), currentUser.username],
        }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptDevicePermission = async () => {
    setPermissionModalOpen(false);
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      showDeviceNotification('LNet: Notificaciones Activadas', {
        body: 'Recibirás avisos en este dispositivo cada vez que los técnicos registren planillas y fotos.',
      });
    }
  };

  return (
    <Box sx={{ px: { xs: 1.5, sm: 3, md: 4 }, pt: 2, pb: 1 }}>
      {/* Floating Dark Pill Navbar matching the reference design */}
      <Box
        sx={{
          backgroundColor: 'rgba(16, 23, 38, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          px: { xs: 2, sm: 3 },
          py: 1.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Left: Brand Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ color: '#94a3b8', p: 0.5, mr: 0.5 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              cursor: 'pointer',
            }}
            onClick={() => handleNavClick('dashboard')}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img src="/favicon.svg" alt="LNet Logo" style={{ width: 20, height: 20 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: 0.8,
                color: '#ffffff',
                fontFamily: '"Outfit", "Roboto", sans-serif',
              }}
            >
              L<span style={{ color: '#38bdf8' }}>Net</span>
            </Typography>
          </Box>
        </Box>

        {/* Center: Sleek Active Pill Tabs */}
        {!isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(7, 11, 20, 0.65)',
              p: 0.6,
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <Button
                  key={item.id}
                  startIcon={item.icon}
                  onClick={() => handleNavClick(item.id)}
                  sx={{
                    px: 2.2,
                    py: 0.8,
                    borderRadius: '16px',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                    boxShadow: isActive ? '0 4px 15px rgba(56, 189, 248, 0.2)' : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: isActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        )}

        {/* Right: Notifications Bell + User Profile Pill + Logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Admin Notification Bell */}
          {isAdmin && (
            <Tooltip title="Notificaciones de Técnicos">
              <IconButton
                onClick={handleOpenNotifications}
                sx={{
                  color: unreadCount > 0 ? '#38bdf8' : '#94a3b8',
                  backgroundColor: unreadCount > 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: unreadCount > 0 ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  p: 0.9,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(56, 189, 248, 0.25)',
                    color: '#ffffff',
                  },
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      minWidth: 18,
                      height: 18,
                    },
                  }}
                >
                  {unreadCount > 0 ? (
                    <NotificationsActiveIcon sx={{ fontSize: 20, animation: 'pulse 1.5s infinite' }} />
                  ) : (
                    <NotificationsIcon sx={{ fontSize: 20 }} />
                  )}
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* User Profile Pill */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              px: { xs: 1, sm: 1.8 },
              py: 0.6,
              borderRadius: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>

            {!isMobile && (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#f8fafc', lineHeight: 1.2 }}>
                  {currentUser.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#38bdf8', fontSize: '0.7rem', fontWeight: 600 }}>
                  {currentUser.role === 'admin' ? 'Administrador' : 'Técnico'}
                </Typography>
              </Box>
            )}
          </Box>

          <Tooltip title="Cerrar Sesión">
            <IconButton
              onClick={onLogout}
              size="small"
              sx={{
                color: '#94a3b8',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                p: 0.8,
                '&:hover': {
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                },
              }}
            >
              <LogoutIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Notifications Popover Menu */}
      <Popover
        open={Boolean(anchorElNotif)}
        anchorEl={anchorElNotif}
        onClose={handleCloseNotifications}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: { xs: 320, sm: 380 },
            maxHeight: 450,
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            color: '#ffffff',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(15, 23, 42, 0.95)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon sx={{ color: '#38bdf8', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
              Notificaciones de Técnicos
            </Typography>
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon sx={{ fontSize: 14 }} />}
              onClick={handleMarkAllRead}
              sx={{ color: '#38bdf8', fontSize: '0.75rem', textTransform: 'none', p: 0.5 }}
            >
              Marcar leídas
            </Button>
          )}
        </Box>

        <Box sx={{ p: 1, maxHeight: 360, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                No hay notificaciones registradas.
              </Typography>
            </Box>
          ) : (
            notifications.map((item) => {
              const isRead =
                item.read_by &&
                item.read_by.map((u) => u.toLowerCase()).includes(currentUser?.username?.toLowerCase());
              return (
                <Card
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    cursor: 'pointer',
                    borderRadius: 2,
                    backgroundColor: isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(56, 189, 248, 0.08)',
                    border: isRead ? '1px solid rgba(255, 255, 255, 0.04)' : '1px solid rgba(56, 189, 248, 0.3)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      transform: 'translateX(3px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                    <Box
                      sx={{
                        p: 0.8,
                        borderRadius: 1.5,
                        backgroundColor: item.attachments_count > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                        color: item.attachments_count > 0 ? '#10b981' : '#38bdf8',
                        mt: 0.3,
                      }}
                    >
                      {item.attachments_count > 0 ? (
                        <PhotoCameraIcon sx={{ fontSize: 18 }} />
                      ) : (
                        <DescriptionIcon sx={{ fontSize: 18 }} />
                      )}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }}>
                          {item.title}
                        </Typography>
                        {!isRead && (
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#38bdf8' }} />
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ color: '#cbd5e1', fontSize: '0.8rem', mt: 0.3 }}>
                        {item.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
                        {item.created_at}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              );
            })
          )}
        </Box>
      </Popover>

      {/* Device Notification Permission Request Modal */}
      <Dialog
        open={permissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        maxWidth="xs"
        PaperProps={{
          sx: {
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: 3,
            border: '1px solid rgba(56, 189, 248, 0.3)',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <NotificationsActiveIcon sx={{ color: '#38bdf8', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.1rem' }}>
            Activar Notificaciones
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <Typography variant="body2" sx={{ color: '#cbd5e1', lineHeight: 1.6 }}>
            ¿Deseas activar las notificaciones en este dispositivo (móvil o PC)?
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1 }}>
            Recibirás una alerta instantánea cada vez que los técnicos en la calle carguen una nueva planilla o fotos de evidencias.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPermissionModalOpen(false)} sx={{ color: '#94a3b8' }}>
            Más tarde
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAcceptDevicePermission}
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              color: '#070b14',
            }}
          >
            Permitir Notificaciones
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating In-App Live Alert Toast */}
      <Snackbar
        open={liveToast.open}
        autoHideDuration={7000}
        onClose={() => setLiveToast({ ...liveToast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 7 }}
      >
        <Alert
          severity="info"
          icon={<NotificationsActiveIcon sx={{ color: '#38bdf8' }} />}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setLiveToast({ ...liveToast, open: false });
                setActiveTab('history');
              }}
              sx={{ fontWeight: 700, color: '#38bdf8' }}
            >
              Ver
            </Button>
          }
          sx={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            color: '#f8fafc',
            border: '1px solid #38bdf8',
            boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: 2.5,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#38bdf8' }}>
            {liveToast.title}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
            {liveToast.message}
          </Typography>
        </Alert>
      </Snackbar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#0f172a',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            width: 270,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2 }}>
            <img src="/favicon.svg" alt="LNet Logo" style={{ width: 28, height: 28 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
                Sistema LNet
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                {currentUser.name} ({currentUser.role === 'admin' ? 'Admin' : 'Técnico'})
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 2 }} />

          <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    selected={isActive}
                    onClick={() => handleNavClick(item.id)}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      color: isActive ? '#38bdf8' : '#cbd5e1',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? '#38bdf8' : '#94a3b8', minWidth: 36 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500 }} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 2 }} />

          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={onLogout}
            sx={{ borderRadius: 2 }}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}

