import React, { useState, useCallback } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { toast } from 'react-toastify';
import DataTable from '@components/datatable/DataTable';
import Offcanvas from '@components/common/Offcanvas';
import UserForm from '@components/admin/userManagement/UserForm';
import UserDetail from '@components/admin/userManagement/UserDetail';
import { userService } from '@services/userService';

const columns = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'phone', label: 'Phone' },
    {
        id: 'role',
        label: 'Role',
        sortable: true,
        render: (item) => {
            const color = item.role === 'admin' ? 'error' : item.role === 'employee' ? 'warning' : 'success';
            return <Chip label={item.role} color={color} size="small" />;
        }
    },
    {
        id: 'createdAt',
        label: 'Joined Date',
        sortable: true,
        render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
];

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
    const [offcanvasOpen, setOffcanvasOpen] = useState(false);
    const [offcanvasMode, setOffcanvasMode] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tableKey, setTableKey] = useState(Date.now());

    const fetchData = useCallback((params) => {
        return userService.getUsers(params);
    }, []);

    const handleAddClick = () => {
        setSelectedUser(null);
        setOffcanvasMode('create');
        setOffcanvasOpen(true);
    };

    const handleRowClick = (userId) => {
        setSelectedUser({ _id: userId });
        setOffcanvasMode('detail');
        setOffcanvasOpen(true);
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setOffcanvasMode('edit');
        setOffcanvasOpen(true);
    };

    const handleCloseOffcanvas = () => {
        setOffcanvasOpen(false);
    };

    const handleFormSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            if (offcanvasMode === 'edit') {
                await userService.updateUser(selectedUser._id, formData);
                toast.success('User updated successfully!');
            } else {
                await userService.createUser(formData);
                toast.success('User created successfully and credentials sent via email!');
            }
            handleCloseOffcanvas();
            setTableKey(Date.now());
        } catch (error) {
            console.error("Failed to submit form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                User Management
            </Typography>
            <DataTable
                key={tableKey}
                fetchData={fetchData}
                columns={columns}
                entityName="User"
                filterOptions={filterOptions}
                searchPlaceholder="Search by name or email..."
                onAdd={handleAddClick}
                onRowClick={handleRowClick}
            />

            <Offcanvas
                open={offcanvasOpen}
                onClose={handleCloseOffcanvas}
                title={
                    offcanvasMode === 'create' ? 'Add New User' :
                        offcanvasMode === 'edit' ? 'Edit User Information' :
                            'User Details'
                }
                // SỬA Ở ĐÂY: Thay đổi width thành 50%
                width={'50vw'}
            >
                {offcanvasMode === 'detail' && (
                    <UserDetail userId={selectedUser?._id} onEdit={handleEditClick} />
                )}
                {(offcanvasMode === 'create' || offcanvasMode === 'edit') && (
                    <UserForm
                        onSubmit={handleFormSubmit}
                        onCancel={handleCloseOffcanvas}
                        initialData={selectedUser}
                        isSubmitting={isSubmitting}
                    />
                )}
            </Offcanvas>
        </Box>
    );
};

export default UserListPage;