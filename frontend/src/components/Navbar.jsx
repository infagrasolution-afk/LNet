import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

export default function Navbar({ currentUser, activeTab, setActiveTab, onLogout }) {
  const isAdmin = currentUser?.role === 'admin';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar position="sticky" elevation={2} sx={{ background: 'linear-gradient(90deg, #01579b 0%, #0288d1 100%)' }}>
        <Toolbar sx={{ px: { xs: 1.5, sm: 3 } }}>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: { xs: 1, md: 0 }, mr: { xs: 1, md: 4 } }}>
            <img src="/favicon.svg" alt="LNet Logo" style={{ width: 28, height: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}>
              LNet
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                startIcon={<AssignmentIcon />}
                onClick={() => handleNavClick('form')}
                sx={{
                  backgroundColor: activeTab === 'form' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
                  borderRadius: 2,
                  px: 2,
                }}
              >
                Formulario de Carga
              </Button>

              <Button
                color="inherit"
                startIcon={<HistoryIcon />}
                onClick={() => handleNavClick('history')}
                sx={{
                  backgroundColor: activeTab === 'history' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
                  borderRadius: 2,
                  px: 2,
                }}
              >
                Historial
              </Button>

              {isAdmin && (
                <Button
                  color="inherit"
                  startIcon={<AdminPanelSettingsIcon />}
                  onClick={() => handleNavClick('admin')}
                  sx={{
                    backgroundColor: activeTab === 'admin' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
                    borderRadius: 2,
                    px: 2,
                  }}
                >
                  Panel Admin
                </Button>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <Chip
              icon={<PersonIcon style={{ color: '#fff' }} />}
              label={isMobile ? currentUser.username : `${currentUser.name} (${currentUser.role === 'admin' ? 'Admin' : 'Usuario'})`}
              size={isMobile ? "small" : "medium"}
              sx={{
                color: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                fontWeight: 500,
              }}
            />
            <Tooltip title="Cerrar Sesión">
              <IconButton color="inherit" onClick={onLogout} size={isMobile ? "small" : "medium"}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, pt: 2, pb: 2 }} role="presentation">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, pb: 2 }}>
            <img src="/favicon.svg" alt="LNet Logo" style={{ width: 32, height: 32 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" color="primary.dark">
                Sistema LNet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentUser.name}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton
                selected={activeTab === 'form'}
                onClick={() => handleNavClick('form')}
              >
                <ListItemIcon>
                  <AssignmentIcon color={activeTab === 'form' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Formulario de Carga" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                selected={activeTab === 'history'}
                onClick={() => handleNavClick('history')}
              >
                <ListItemIcon>
                  <HistoryIcon color={activeTab === 'history' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Historial de Registros" />
              </ListItemButton>
            </ListItem>

            {isAdmin && (
              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'admin'}
                  onClick={() => handleNavClick('admin')}
                >
                  <ListItemIcon>
                    <AdminPanelSettingsIcon color={activeTab === 'admin' ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText primary="Panel de Administración" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
          <Divider sx={{ my: 1 }} />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={onLogout}>
                <ListItemIcon>
                  <LogoutIcon color="error" />
                </ListItemIcon>
                <ListItemText primary="Cerrar Sesión" sx={{ color: 'error.main' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
