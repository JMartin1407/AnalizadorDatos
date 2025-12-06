import { createTheme } from '@mui/material/styles';

// Paleta de colores personalizada
export const colorPalette = {
  primary1: '#4C7FAE',      // Azul oscuro (#4C7FAE)
  primary2: '#4F6AB4',      // Gris azulado (#4F6AB4)
  primary3: '#3B8CD9',      // Azul brillante (#3B8CD9)
  primary4: '#454F59',      // Gris oscuro (#454F59)
  dark: '#2C3033',          // Negro oscuro (#2C3033)
  accent: '#242C33',        // Gris muy oscuro (#242C33)
  secondary1: '#10B981',    // Verde para docente
  accent1: '#F59E0B',       // Naranja para énfasis
};

export const theme = createTheme({
  palette: {
    primary: {
      main: colorPalette.primary1,
      light: colorPalette.primary3,
      dark: colorPalette.primary2,
    },
    secondary: {
      main: colorPalette.primary4,
      light: colorPalette.primary2,
      dark: colorPalette.dark,
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: colorPalette.dark,
      secondary: colorPalette.primary4,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: colorPalette.primary1,
    },
    h2: {
      fontWeight: 700,
      color: colorPalette.primary1,
    },
    h3: {
      fontWeight: 600,
      color: colorPalette.primary2,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: colorPalette.primary1,
          '& .MuiTableCell-head': {
            backgroundColor: colorPalette.primary1,
            color: '#ffffff',
            fontWeight: 700,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: `${colorPalette.primary3}15`,
          },
        },
      },
    },
  },
});
