import React from 'react';
import { Drawer, List, Toolbar, Divider, Typography, Box, Avatar } from '@mui/material';
import TheatersIcon from '@mui/icons-material/Theaters';
import { useAuth } from '@context/AuthContext.jsx';
import navConfig from './menu';
import MenuItem from './MenuItem';

const Sidebar = ({ isSidebarOpen, onToggleSidebar, sidebarWidth, isMobile }) => {
    const { user } = useAuth();

    const sidebarContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header section */}
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                <TheatersIcon sx={{ color: 'primary.main', fontSize: 32, mr: 1 }} />
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>OCBS</Typography>
            </Toolbar>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}/>

            <List component="nav" sx={{ flexGrow: 1, p: 0, py: 1 }}>
                {navConfig.map((item, index) => (
                    <MenuItem
                        key={`${item.text}-${index}`}
                        item={item}
                        isMobile={isMobile}
                        onToggleSidebar={onToggleSidebar}
                    />
                ))}
            </List>

            <Box sx={{ p: 2, mt: 'auto' }}>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '1rem' }}>
                        {user?.name?.charAt(0).toUpperCase() || 'A'}
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
                },
            }}
        >
            {sidebarContent}
        </Drawer>
    );
};

export default Sidebar;
