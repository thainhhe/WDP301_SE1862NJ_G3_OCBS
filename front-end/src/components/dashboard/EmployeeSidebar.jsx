import React from 'react';
import { Drawer, List, Toolbar, Divider, Typography, Box, Avatar, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import TheatersIcon from '@mui/icons-material/Theaters';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '@context/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

const EmployeeSidebar = ({ isSidebarOpen, onToggleSidebar, sidebarWidth, isMobile }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        const success = await logout();
        if (success) {
            navigate('/login');
        }
    };

    const menuItems = [
        {
            text: 'Employee Dashboard',
            icon: <DashboardIcon />,
            path: '/admin/employee-dashboard',
        },
        {
            text: 'Quét mã QR vé',
            icon: <QrCodeScannerIcon />,
            path: '/admin/qr-checkin',
        },
        {
            text: 'Đặt vé cho khách',
            icon: <AssignmentIcon />,
            path: '/admin/employee-book-ticket',
        },
        {
            text: 'Danh sách vé đã đặt',
            icon: <AssignmentIcon />,
            path: '/admin/employee-bookings',
        },
    ];

    const sidebarContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header section */}
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                <TheatersIcon sx={{ color: 'primary.main', fontSize: 32, mr: 1 }} />
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>OCBS</Typography>
            </Toolbar>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}/>

            <List component="nav" sx={{ flexGrow: 1, p: 0, py: 1 }}>
                {menuItems.map((item, idx) => (
                    <ListItem
                        button={true}
                        key={item.text}
                        selected={location.pathname === item.path}
                        onClick={() => navigate(item.path)}
                        sx={{ color: 'white', '&.Mui-selected': { bgcolor: 'primary.main', color: 'white' } }}
                    >
                        <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
                <ListItem button={true} onClick={handleLogout} sx={{ color: 'white' }}>
                    <ListItemIcon sx={{ color: 'inherit' }}><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Đăng xuất" />
                </ListItem>
            </List>

            <Box sx={{ p: 2, mt: 'auto' }}>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '1rem' }}>
                        {user?.name?.charAt(0).toUpperCase() || 'E'}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{user?.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>{user?.role}</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Drawer
            variant={isMobile ? 'temporary' : 'persistent'}
            open={isSidebarOpen}
            onClose={onToggleSidebar}
            sx={{
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: sidebarWidth,
                    boxSizing: 'border-box',
                    borderRight: 'none',
                    overflowX: 'hidden',
                    bgcolor: 'primary.dark',
                    color: 'white',
                },
            }}
        >
            {sidebarContent}
        </Drawer>
    );
};

export default EmployeeSidebar; 