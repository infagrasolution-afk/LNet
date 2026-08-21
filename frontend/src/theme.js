import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0288d1', // Sleek Telecom Cyan/Blue
      dark: '#01579b',
      light: '#03a9f4',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7b1fa2', // Elegant Violet accent
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(2, 136, 209, 0.25)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        },
      },
    },
  },
});

export default theme;
