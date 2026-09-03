import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#38bdf8', // Neon Sky Blue
      dark: '#0284c7',
      light: '#7dd3fc',
      contrastText: '#070b14',
    },
    secondary: {
      main: '#818cf8', // Electric Indigo
      dark: '#4f46e5',
      light: '#a5b4fc',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981', // Emerald
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b', // Amber
    },
    error: {
      main: '#ef4444', // Red
    },
    info: {
      main: '#06b6d4', // Cyan
    },
    background: {
      default: '#070b14', // Deep futuristic night slate
      paper: '#101726',   // High-tech dark card surface
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: '"Outfit", "Roboto", "Inter", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.3px',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.2px',
    },
    subtitle1: {
      fontWeight: 500,
      color: '#cbd5e1',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#070b14',
          color: '#f8fafc',
          scrollbarColor: '#1e293b #070b14',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#1e293b',
            border: '2px solid #070b14',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#101726',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
          borderRadius: 20,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '8px 20px',
          boxShadow: 'none',
          transition: 'all 0.25s ease',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(56, 189, 248, 0.25)',
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
          color: '#070b14',
          fontWeight: 700,
          '&:hover': {
            background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
            color: '#ffffff',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          color: '#e2e8f0',
        },
        head: {
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.8px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(56, 189, 248, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#38bdf8',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
