import React from 'react';
import DataTable from '../../../components/datatable/DataTable';
import { userService } from '../../../services/userService';
import { Box, Typography, Chip } from '@mui/material';

// Định nghĩa các cột cho bảng user
const columns = [
    { id: 'name', label: 'Name', sortable: true }, // <-- Thêm sortable
    { id: 'email', label: 'Email', sortable: true }, // <-- Thêm sortable
    { id: 'phone', label: 'Phone' }, // Không thể sort
    { id: 'role', label: 'Role', sortable: true }, // <-- Thêm sortable
    {
        id: 'createdAt',
        label: 'Joined Date',
        sortable: true, // <-- Thêm sortable
        render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
];

// Định nghĩa các lựa chọn cho bộ lọc
const filterOptions = [
    {
        id: 'role',
        label: 'Role',
        options: [
            { value: 'admin', label: 'Admin' },
            { value: 'employee', label: 'Employee' },
            { value: 'user', label: 'User' },
        ]
    }
];

const UserListPage = () => {
    const handleAddUser = () => {
        console.log("Add new user clicked!");
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                User Management
            </Typography>
            <DataTable
                fetchData={userService.getUsers}
                columns={columns}
                entityName="User"
                filterOptions={filterOptions}
                searchPlaceholder="Search by name or email..."
                onAdd={handleAddUser}
            />
        </Box>
    );
};

export default UserListPage;
