import React from 'react';
import { Drawer, Box, Typography, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Offcanvas = ({
                       open,
                       onClose,
                       title,
                       children,
                       width = 450,
                   }) => {
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: width },
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        flexShrink: 0,
                    }}
                >
                    <Typography variant="h6" fontWeight="bold">{title}</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider />

                {/* Content */}
                <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
                    {children}
                </Box>
            </Box>
        </Drawer>
    );
};

export default Offcanvas;
