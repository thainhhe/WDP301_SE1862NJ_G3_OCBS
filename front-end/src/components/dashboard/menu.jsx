import DashboardIcon from '@mui/icons-material/Dashboard';
import MovieIcon from '@mui/icons-material/Movie';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';

const navConfig = [
    {
        type: 'item',
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/admin/dashboard',
    },
    {
        type: 'title',
        text: 'Management',
    },
    {
        type: 'item',
        text: 'Movie Management',
        icon: <MovieIcon />,
        path: '/admin/movies',
    },
    {
        type: 'item',
        text: 'User Management',
        icon: <PeopleIcon />,
        path: '/admin/users',
    },
    {
        type: 'parent',
        text: 'Settings',
        icon: <SettingsIcon />,
        children: [
            {
                type: 'item',
                text: 'General',
                path: '/admin/settings/general',
            },
            {
                type: 'item',
                text: 'Permissions',
                path: '/admin/settings/permissions',
            },
        ],
    },
    {
        type: 'title',
        text: 'Analytics'
    },
    {
        type: 'parent',
        text: 'Reports',
        icon: <BarChartIcon />,
        children: [
            {
                type: 'item',
                text: 'Sales Report',
                path: '/admin/reports/sales',
            },
            {
                type: 'item',
                text: 'User Report',
                path: '/admin/reports/users',
            }
        ]
    }
];

export default navConfig;