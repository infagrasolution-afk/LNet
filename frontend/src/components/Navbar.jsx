import React, { useState } from 'react';
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
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

export default function Navbar({ currentUser, activeTab, setActiveTab, onLogout }) {
  const isAdmin = currentUser?.role === 'admin';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

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

        {/* Center: Sleek Active Pill Tabs matching reference */}
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

        {/* Right: User Profile Pill */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
