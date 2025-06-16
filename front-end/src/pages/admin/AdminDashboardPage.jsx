import React from 'react';
import { Typography, Paper, Grid, Box, Card} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import TheatersIcon from '@mui/icons-material/Theaters';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const summaryData = [
    { title: 'Total Users', value: '1,280', icon: <PeopleAltIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { title: 'Total Movies', value: '75', icon: <TheatersIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { title: 'Monthly Revenue', value: '$7,500', icon: <AttachMoneyIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
];

const chartData = [
    { name: 'Jan', Revenue: 4000 },
    { name: 'Feb', Revenue: 3000 },
    { name: 'Mar', Revenue: 2000 },
    { name: 'Apr', Revenue: 2780 },
    { name: 'May', Revenue: 1890 },
    { name: 'Jun', Revenue: 2390 },
];

const AdminDashboardPage = () => {
    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome Back!
            </Typography>

            <Grid container spacing={3} mb={4}>
                {summaryData.map(item => (
                    <Grid item xs={12} sm={6} md={4} key={item.title}>
                        <Card elevation={2} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                            {item.icon}
                            <Box sx={{ ml: 2 }}>
                                <Typography color="text.secondary">{item.title}</Typography>
                                <Typography variant="h5" fontWeight="bold">{item.value}</Typography>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Revenue Chart (Last 6 Months)</Typography>
                        <Box sx={{ height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Revenue" fill="#D32F2F" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboardPage;