import { createTheme } from '@mui/material/styles';

const primaryColor = '#D32F2F';
const secondaryColor = '#212121';
const backgroundColor = '#F4F6F8';
const paperColor = '#FFFFFF';

const theme = createTheme({
    palette: {
        primary: {
            main: primaryColor,
        },
        secondary: {
            main: secondaryColor,
        },
        background: {
            default: backgroundColor,
            paper: paperColor,
        },
        text: {
            primary: '#212121', // Màu chữ chính
            secondary: '#757575', // Màu chữ phụ
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: paperColor,
                    color: secondaryColor,
                    boxShadow: '0 2px 4px -1px rgba(0,0,0,0.06), 0 4px 5px 0 rgba(0,0,0,0.04), 0 1px 10px 0 rgba(0,0,0,0.08)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: secondaryColor,
                    color: 'white',
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: 'white',
                }
            }
        }
    },
});

export default theme;