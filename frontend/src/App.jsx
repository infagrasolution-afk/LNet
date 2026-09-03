import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';

import Login from './components/Login';
import Navbar from './components/Navbar';
import DashboardOverview from './components/DashboardOverview';
import FormSection from './components/FormSection';
import HistorySection from './components/HistorySection';
import AdminPanel from './components/AdminPanel';

import { loginUser, saveRecord } from './services/api';

// 10 minutes of inactivity limit in milliseconds
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'form' | 'history' | 'admin'
  const [sessionMessage, setSessionMessage] = useState(null);
  const inactivityTimerRef = useRef(null);

  // On page load or refresh: always require login (do not restore session)
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const handleLogout = (reason = null) => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    setCurrentUser(null);
    sessionStorage.clear();
    setSessionMessage(reason);
  };

  const handleLogin = async (username, password) => {
    const res = await loginUser(username, password);
    setCurrentUser(res.user);
    setSessionMessage(null);
    setActiveTab('dashboard');
  };

  // Inactivity auto-logout tracker (10 minutes)
  useEffect(() => {
    if (!currentUser) return;

    const resetTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(() => {
        handleLogout('Su sesión ha expirado automáticamente por inactividad (10 minutos).');
      }, INACTIVITY_TIMEOUT_MS);
    };

    // Events indicating user activity
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, resetTimer, { passive: true });
    });

    // Start initial timer
    resetTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, resetTimer);
      });
    };
  }, [currentUser]);

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
          <Login onLoginSuccess={handleLogin} sessionMessage={sessionMessage} />
        ) : (
          <>
            <Navbar
              currentUser={currentUser}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onLogout={() => handleLogout()}
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
