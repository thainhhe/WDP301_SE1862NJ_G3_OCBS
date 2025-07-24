import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Paper, Grid, Box, Card, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import TheatersIcon from '@mui/icons-material/Theaters';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, addDays, differenceInDays } from 'date-fns';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { getDashboardStats } from '@services/dashboardService.js';
import { getAllMovies } from '@services/movieService.js';
import { getAllBranches } from '@services/branchService.js';

const StatCard = ({ title, value, icon }) => (
    <Card elevation={2} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        {icon}
        <Box sx={{ ml: 2 }}>
            <Typography color="text.secondary">{title}</Typography>
            <Typography variant="h5" fontWeight="bold">{value}</Typography>
        </Box>
    </Card>
);

const getRecentYears = (num = 5) => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: num }, (_, i) => currentYear - i);
};

function generateMonthDays(year, month) {
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(start);
    const days = [];
    for (let d = start; d <= end; d = addDays(d, 1)) {
        days.push(format(d, 'yyyy-MM-dd'));
    }
    return days;
}

const AdminDashboardPage = () => {
    const now = new Date();
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        movieId: '',
        branchId: '',
        month: now.getMonth() + 1, // 1-12
        year: now.getFullYear(),
    });
    const [movies, setMovies] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFiltersData = async () => {
            try {
                const [moviesData, branchesData] = await Promise.all([
                    getAllMovies(),
                    getAllBranches(),
                ]);
                setMovies(moviesData);
                setBranches(branchesData);
            } catch (err) {
                console.error("Failed to fetch filters data", err);
                setError("Could not load filter options.");
            }
        };
        fetchFiltersData();
    }, []);
    
    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const startDate = format(startOfMonth(new Date(filters.year, filters.month - 1)), 'yyyy-MM-dd');
                const endDate = format(endOfMonth(new Date(filters.year, filters.month - 1)), 'yyyy-MM-dd');
                const params = {
                    period: 'month',
                    movieId: filters.movieId || undefined,
                    branchId: filters.branchId || undefined,
                    from: startDate,
                    to: endDate,
                };
                const data = await getDashboardStats(params);
                setStats(data);
                setError('');
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
                setError("Could not load dashboard data.");
                setStats(null);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Tạo dữ liệu biểu đồ với đủ ngày trong tháng, cách nhau 4 ngày trên trục X
    const formattedChartData = useMemo(() => {
        if (!stats?.dailyStats) return [];
        const days = generateMonthDays(filters.year, filters.month);
        const statsMap = new Map(stats.dailyStats.map(item => [item.date, item]));
        return days.map(dateStr => {
            const stat = statsMap.get(dateStr);
            return {
                date: format(parseISO(dateStr), 'dd/MM'),
                revenue: stat?.revenue || 0,
                tickets: stat?.tickets || 0,
                bookings: stat?.bookings || 0,
                rawDate: dateStr,
            };
        });
    }, [stats, filters]);

    const summaryData = useMemo(() => [
        { title: 'Total Revenue', value: `${stats?.totalRevenue.toLocaleString('vi-VN') || 0} VND`, icon: <AttachMoneyIcon sx={{ fontSize: 40, color: 'success.main' }} /> },
        { title: 'Tickets Sold', value: stats?.totalTickets.toLocaleString('en-US') || 0, icon: <TheatersIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
        { title: 'Total Bookings', value: stats?.totalBookings.toLocaleString('en-US') || 0, icon: <PeopleAltIcon sx={{ fontSize: 40, color: 'warning.main' }} /> },
    ], [stats]);

    // Hiển thị khoảng thời gian filter
    const periodLabel = useMemo(() => {
        const startDate = format(startOfMonth(new Date(filters.year, filters.month - 1)), 'dd/MM/yyyy');
        const endDate = format(endOfMonth(new Date(filters.year, filters.month - 1)), 'dd/MM/yyyy');
        return `Month: ${startDate} – ${endDate}`;
    }, [filters]);

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];
    const years = getRecentYears(5);

    // Custom tick cho XAxis: chỉ hiển thị các ngày chia hết cho 4 hoặc là ngày đầu/cuối tháng
    const CustomXAxisTick = (props) => {
        const { x, y, payload } = props;
        const day = parseInt(payload.value.split('/')[0], 10);
        const isFirst = day === 1;
        const isLast = day === new Date(filters.year, filters.month, 0).getDate();
        if (isFirst || isLast || day % 4 === 1) {
            return (
                <text x={x} y={y + 10} textAnchor="middle" fontSize={12}>{payload.value}</text>
            );
        }
        return null;
    };

    return (
        <Box>
            {/* Filters */}
            <Grid container spacing={2} mb={2} alignItems="center">
                <Grid item size={{xs: 12, sm: 6, md: 2}}>
                    <FormControl fullWidth>
                        <InputLabel>Month</InputLabel>
                        <Select name="month" value={filters.month} label="Month" onChange={handleFilterChange}>
                            {months.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item size={{xs: 12, sm: 6, md: 2}}>
                    <FormControl fullWidth>
                        <InputLabel>Year</InputLabel>
                        <Select name="year" value={filters.year} label="Year" onChange={handleFilterChange}>
                            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item size={{xs: 12, sm: 6, md: 4}}>
                    <Autocomplete
                        options={movies}
                        getOptionLabel={option => option.title || ''}
                        value={movies.find(m => m._id === filters.movieId) || null}
                        onChange={(e, value) => setFilters(prev => ({ ...prev, movieId: value ? value._id : '' }))}
                        renderInput={params => <TextField {...params} label="Movie" variant="outlined" />}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        clearOnEscape
                    />
                </Grid>
                <Grid item size={{xs: 12, sm: 6, md: 4}}>
                    <Autocomplete
                        options={branches}
                        getOptionLabel={option => option.name || ''}
                        value={branches.find(b => b._id === filters.branchId) || null}
                        onChange={(e, value) => setFilters(prev => ({ ...prev, branchId: value ? value._id : '' }))}
                        renderInput={params => <TextField {...params} label="Branch" variant="outlined" />}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        clearOnEscape
                    />
                </Grid>
            </Grid>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : stats && (
                <>
                    {/* Summary Cards */}
                    <Grid container spacing={3} mb={4}>
                        {summaryData.map(item => (
                            <Grid item size={{xs: 12, sm: 6, md: 4}} key={item.title}>
                                <StatCard {...item} />
                            </Grid>
                        ))}
                    </Grid>

                    {/* Charts */}
                    <Grid container spacing={3}>
                        <Grid item size={{xs: 12, md: 6}}>
                            <Paper elevation={2} sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>Revenue (VND)</Typography>
                                <Box sx={{ height: 350 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={formattedChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="date" tick={<CustomXAxisTick />} interval={0} />
                                            <YAxis tickFormatter={(value) => new Intl.NumberFormat('vi-VN').format(value)} />
                                            <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} VND`} />
                                            <Legend />
                                            <Bar dataKey="revenue" fill="#4caf50" name="Revenue" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item size={{xs: 12, md: 6}}>
                           <Paper elevation={2} sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>Tickets Sold</Typography>
                                <Box sx={{ height: 350 }}>
                                     <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={formattedChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" tick={<CustomXAxisTick />} interval={0} />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="tickets" stroke="#2196f3" name="Tickets" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
};

export default AdminDashboardPage;

