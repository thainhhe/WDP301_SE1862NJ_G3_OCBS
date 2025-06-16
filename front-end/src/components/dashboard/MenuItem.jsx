import React, { useState } from 'react';
import { List, ListItemButton, ListItemIcon, ListItemText, Typography, Collapse } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useAuth } from '@context/AuthContext.jsx';

/**
 * Component to render a single menu item, including titles, links, and parent items with children.
 * It handles its own state for collapsing and expanding.
 */
const MenuItem = ({ item, isMobile, onToggleSidebar }) => {
    const { user } = useAuth();
    const location = useLocation();

    const isParentActive = item.children?.some(child => location.pathname.startsWith(child.path)) || false;

    const [open, setOpen] = useState(isParentActive);

    const handleClick = () => {
        setOpen(!open);
    };


    if (item.roles && !item.roles.includes(user?.role)) {
        return null;
    }

    if (item.type === 'title') {
        return (
            <Typography
                variant="overline"
                sx={{
                    px: 2,
                    mt: 2,
                    mb: 1,
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 'bold',
                    fontSize: '0.65rem',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                }}
            >
                {item.text}
            </Typography>
        );
    }

    const commonItemStyles = {
        py: 0.8,
        minHeight: 40,
        borderRadius: 1.5,
        color: 'rgba(255, 255, 255, 0.8)',
        '&.active': {
            backgroundColor: 'primary.main',
            color: 'white',
            '& .MuiListItemIcon-root': { color: 'white' },
        },
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
    };

    const commonIconStyles = {
        minWidth: 'auto',
        marginRight: 2,
        fontSize: '1.25rem',
        color: 'inherit'
    };

    if (item.type === 'parent') {
        return (
            <>
                <ListItemButton onClick={handleClick} sx={{ ...commonItemStyles, mx: 1.5, my: 0.25 }}>
                    <ListItemIcon sx={commonIconStyles}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
                    {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {item.children.map(child => (
                            <MenuItem key={child.text} item={child} isMobile={isMobile} onToggleSidebar={onToggleSidebar} />
                        ))}
                    </List>
                </Collapse>
            </>
        );
    }

    return (
        <ListItemButton
            component={NavLink}
            to={item.path}
            onClick={isMobile ? onToggleSidebar : null}
            sx={{
                ...commonItemStyles,
                mx: 1.5,
                my: 0.25,
                pl: item.path.split('/').length > 3 ? 4.5 : 2.5,
            }}
        >
            {item.icon && <ListItemIcon sx={commonIconStyles}>{item.icon}</ListItemIcon>}
            <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem' }} />
        </ListItemButton>
    );
};

export default MenuItem;
