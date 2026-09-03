import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';

import Login from './components/Login';
import Navbar from './components/Navbar';
import DashboardOverview from './components/DashboardOverview';
import FormSection from './components/FormSection';
import HistorySection from './components/HistorySection';
import AdminPanel from './components/AdminPanel';

import { loginUser, saveRecord } from './services/api';

const SESSION_USER_KEY = 'lnet_active_session';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'form' | 'history' | 'admin'

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_USER_KEY);
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse session user', e);
    }
  }, []);

  const handleLogin = async (username, password) => {
    const res = await loginUser(username, password);
    setCurrentUser(res.user);
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.user));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem(SESSION_USER_KEY);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#070b14',
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(14, 30, 60, 0.45) 0%, rgba(7, 11, 20, 0) 70%)',
        }}
      >
        {!currentUser ? (
          <Login onLoginSuccess={handleLogin} />
        ) : (
          <>
            <Navbar
              currentUser={currentUser}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onLogout={handleLogout}
            />

            <Box sx={{ flexGrow: 1, pb: 4 }}>
              {activeTab === 'dashboard' && (
                <DashboardOverview currentUser={currentUser} onNavigate={setActiveTab} />
              )}
              {activeTab === 'form' && (
                <FormSection currentUser={currentUser} onSaveRecord={saveRecord} />
              )}
              {activeTab === 'history' && <HistorySection currentUser={currentUser} />}
              {activeTab === 'admin' && currentUser.role === 'admin' && <AdminPanel />}
            </Box>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
}
