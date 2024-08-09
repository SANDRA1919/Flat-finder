import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#004d40', // Verde smarald
    },
    secondary: {
      main: '#00796b', // Verde deschis
    },
    background: {
      default: '#e0f2f1', // Fundal deschis
    },
    text: {
      primary: '#004d40', // Text verde închis
    },
  },
  typography: {
    fontFamily: 'Dancing Script, cursive', // Font personalizat
    h5: {
      fontFamily: 'Dancing Script, cursive',
    },
  },
});

export default theme;