import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';

import Login from './components/Login';
import Navbar from './components/Navbar';
import FormSection from './components/FormSection';
import HistorySection from './components/HistorySection';
import AdminPanel from './components/AdminPanel';

import { loginUser, saveRecord } from './services/api';

const SESSION_USER_KEY = 'lnet_active_session';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'history' | 'admin'

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
    setActiveTab('form');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem(SESSION_USER_KEY);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
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

            <Box sx={{ flexGrow: 1, py: 2 }}>
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
