import React, { useState, useEffect } from 'react';
import {
    TextField, Button, Stack, FormControl, Select, MenuItem, Box,
    Grid, Alert, RadioGroup, FormControlLabel, Radio, Typography
} from '@mui/material';

// Component con để hiển thị label và dấu sao đỏ, giúp code chính gọn gàng hơn.
const FormLabel = ({ children, required = false }) => (
    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.primary' }}>
        {children}
        {required && <span style={{ color: '#D32F2F' }}> *</span>}
    </Typography>
);

const UserForm = ({ onSubmit, onCancel, initialData = null, isSubmitting }) => {
    // Khởi tạo state với tất cả các trường
    const [formData, setFormData] = useState({
        email: '', phone: '', role: 'user', password: '',
        firstName: '', lastName: '', gender: 'male', address: '', dob: ''
    });

    const isEditMode = Boolean(initialData);

    useEffect(() => {
        // Hàm này sẽ được gọi mỗi khi initialData thay đổi
        if (isEditMode && initialData) {
            const nameParts = initialData.name?.split(' ') || [''];
            const lastName = nameParts.pop() || '';
            const firstName = nameParts.join(' ');

            setFormData({
                email: initialData.email || '',
                phone: initialData.phone || '',
                role: initialData.role || 'user', // <-- Đảm bảo role được gán đúng
                password: '',
                firstName: firstName,
                lastName: lastName,
                gender: initialData.gender || 'male',
                address: initialData.address || '',
                dob: initialData.dob ? new Date(initialData.dob).toISOString().split('T')[0] : ''
            });
        } else {
            // Reset form về trạng thái mặc định khi tạo mới
            setFormData({
                email: '', phone: '', role: 'user', password: '',
                firstName: '', lastName: '', gender: 'male', address: '', dob: ''
            });
        }
    }, [initialData, isEditMode]); // Chạy lại effect khi các prop này thay đổi

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSubmit = {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
        };
        if (isEditMode && formData.password) {
            dataToSubmit.password = formData.password;
        }
        onSubmit(dataToSubmit);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
                <Grid container spacing={3}>
                    {/* --- Hàng 1: First Name (40%), Last Name (40%), Role (20%) --- */}
                    <Grid item xs={12} sm={5}>
                        <FormLabel required>First Name</FormLabel>
                        <TextField name="firstName" value={formData.firstName} onChange={handleChange} required fullWidth size="small" />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                        <FormLabel required>Last Name</FormLabel>
                        <TextField name="lastName" value={formData.lastName} onChange={handleChange} required fullWidth size="small" />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <FormLabel required>Role</FormLabel>
                        <FormControl fullWidth size="small">
                            {/* FIX: Thêm displayEmpty để hiển thị đúng khi giá trị là '' */}
                            <Select name="role" value={formData.role} onChange={handleChange} displayEmpty>
                                <MenuItem value="user">User</MenuItem>
                                <MenuItem value="employee">Employee</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* --- Hàng 2: Date of Birth & Gender --- */}
                    <Grid item xs={12} md={6}>
                        <FormLabel>Date of Birth</FormLabel>
                        <TextField type="date" name="dob" value={formData.dob} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl>
                            <FormLabel>Gender</FormLabel>
                            <RadioGroup row name="gender" value={formData.gender} onChange={handleChange}>
                                <FormControlLabel value="male" control={<Radio size="small" />} label="Male" />
                                <FormControlLabel value="female" control={<Radio size="small" />} label="Female" />
                                <FormControlLabel value="other" control={<Radio size="small" />} label="Other" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>

                    {/* --- Hàng 3: Email & Phone (50% / 50%) --- */}
                    <Grid item xs={12} md={6}>
                        <FormLabel required>Email Address</FormLabel>
                        <TextField name="email" type="email" value={formData.email} onChange={handleChange} required fullWidth size="small" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormLabel>Phone Number</FormLabel>
                        <TextField name="phone" value={formData.phone} onChange={handleChange} fullWidth size="small" />
                    </Grid>

                    {/* --- Password (Chỉ hiển thị ở chế độ Edit) --- */}
                    {isEditMode && (
                        <Grid item xs={12}>
                            <FormLabel>New Password</FormLabel>
                            <TextField
                                name="password" type="password" value={formData.password} onChange={handleChange} fullWidth size="small"
                                placeholder="Leave blank to keep current password"
                            />
                        </Grid>
                    )}
                </Grid>

                {/* Thông báo mật khẩu cho chế độ Create */}
                {!isEditMode && (
                    <Alert severity="info" variant="outlined" sx={{ mt: 1 }}>
                        A secure, random password will be generated and sent to the user's email address.
                    </Alert>
                )}

                {/* Các nút hành động */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
                    <Button onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create User')}
                    </Button>
                </Box>
            </Stack>
        </form>
    );
};

export default UserForm;
