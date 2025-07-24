import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Box, Avatar, Menu, MenuItem, Tooltip, Badge, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext.jsx';

const Topbar = ({ onToggleSidebar, isSidebarOpen, sidebarWidth }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu = () => setAnchorElUser(null);

    const handleLogout = () => {
        handleCloseUserMenu();
        logout();
        navigate('/login');
    };

    const handleProfile = () => {
        handleCloseUserMenu();
        navigate('/profile');
    };

    return (
        <AppBar
            position="fixed"
            elevation={1}
            sx={(theme) => ({
                // Chỉ thay đổi width và marginLeft của AppBar trên màn hình lớn
                [theme.breakpoints.up('sm')]: {
                    width: isSidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%',
                    ml: isSidebarOpen ? `${sidebarWidth}px` : 0,
                },
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            })}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="toggle drawer"
                    edge="start"
                    onClick={onToggleSidebar}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Notifications">
                        <IconButton color="inherit">
                            <Badge badgeContent={4} color="primary">
                                <NotificationsOutlinedIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Open settings">
                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                    <Menu
                        sx={{ mt: '45px' }}
                        anchorEl={anchorElUser}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        keepMounted
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                    >
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography variant="h6" component="div">{user?.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                        </Box>
                        <MenuItem onClick={handleProfile}>
                            <PersonOutlineOutlinedIcon sx={{ mr: 1 }}/>
                            Profile
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <LogoutOutlinedIcon sx={{ mr: 1 }}/>
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Topbar;
