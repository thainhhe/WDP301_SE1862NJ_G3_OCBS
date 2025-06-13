import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, CircularProgress, Avatar, Stack, Chip, Divider, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import { userService } from '@services/userService';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return <div role="tabpanel" hidden={value !== index} {...other}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>;
};

const ProfileInfo = ({ user }) => (
    <Stack spacing={2}>
        <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
        <Typography variant="body1">{user.name}</Typography>
        <Divider />
        <Typography variant="subtitle2" color="text.secondary">Email Address</Typography>
        <Typography variant="body1">{user.email}</Typography>
        <Divider />
        <Typography variant="subtitle2" color="text.secondary">Phone Number</Typography>
        <Typography variant="body1">{user.phone || 'N/A'}</Typography>
        <Divider />
        <Typography variant="subtitle2" color="text.secondary">Role</Typography>
        <Chip label={user.role} color={user.role === 'admin' ? 'error' : user.role === 'employee' ? 'warning' : 'success'} size="small" />
    </Stack>
);

const UserDetail = ({ userId, onEdit }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (!userId) return;
        const fetchUser = async () => {
            setLoading(true);
            try {
                const res = await userService.getUser(userId);
                setUser(res.data);
            } catch (err) {
                console.error("Failed to fetch user details", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (!user) return <Typography sx={{ p: 4, textAlign: 'center' }}>User not found.</Typography>;

    return (
        <Box>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>{user.name.charAt(0).toUpperCase()}</Avatar>
                <Box>
                    <Typography variant="h5" fontWeight="bold">{user.name}</Typography>
                    <Typography variant="body1" color="text.secondary">{user.email}</Typography>
                </Box>
                <Box flexGrow={1} />
                <Button variant="outlined" onClick={() => onEdit(user)}>Edit</Button>
            </Stack>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab label="Details" icon={<PersonIcon />} iconPosition="start" />
                    <Tab label="Booking History" icon={<HistoryIcon />} iconPosition="start" />
                </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}><ProfileInfo user={user} /></TabPanel>
            <TabPanel value={tabValue} index={1}><Typography>Booking history will be displayed here.</Typography></TabPanel>
        </Box>
    );
};

export default UserDetail;
