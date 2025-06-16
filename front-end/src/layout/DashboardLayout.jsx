import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery, CssBaseline } from '@mui/material';
import Topbar from '@components/dashboard/Topbar';
import Sidebar from '@components/dashboard/Sidebar';

const sidebarWidth = 260;

const DashboardLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);

    const handleToggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* Topbar không thay đổi */}
            <Topbar
                onToggleSidebar={handleToggleSidebar}
                isSidebarOpen={isSidebarOpen}
                sidebarWidth={sidebarWidth}
            />

            {/* Sidebar không thay đổi */}
            <Sidebar
                onToggleSidebar={handleToggleSidebar}
                isSidebarOpen={isSidebarOpen}
                sidebarWidth={sidebarWidth}
                isMobile={isMobile}
            />

            {/* Main Content Area - SỬA ĐỔI CHÍNH Ở ĐÂY */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: '100%',
                    // Trên màn hình lớn (sm trở lên), tính toán lại width
                    [theme.breakpoints.up('sm')]: {
                        width: isSidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%',
                        ml: isSidebarOpen ? `${sidebarWidth}px` : 0,
                    },
                    // Áp dụng hiệu ứng chuyển động cho width và margin
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                {/* Spacer để nội dung không bị Topbar che */}
                <Box sx={theme.mixins.toolbar} />
                <Outlet />
            </Box>
        </Box>
    );
};

export default DashboardLayout;
