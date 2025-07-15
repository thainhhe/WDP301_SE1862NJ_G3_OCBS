import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    TextField, Button, Stack, FormControl, Select, MenuItem, Box,
    Grid, Alert, RadioGroup, FormControlLabel, Radio, Typography, FormHelperText
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// Component con để hiển thị label và dấu sao đỏ
const FormLabel = ({ children, required = false }) => (
    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.primary' }}>
        {children}
        {required && <span style={{ color: '#D32F2F' }}> *</span>}
    </Typography>
);

// Zod validation schema
const userSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    phone: z.string().optional().or(z.literal('')),
    role: z.enum(['user', 'employee', 'admin']),
    password: z.string().optional().or(z.literal('')).refine(val => !val || val.length >= 6, {
        message: 'Password must be at least 6 characters'
    }),
    gender: z.enum(['male', 'female', 'other']),
    address: z.string().optional(),
    dob: z.date().optional().nullable(),
});

const UserForm = ({ onFormSubmit, onCancel, initialData = null, isSubmitting }) => {
    const isEditMode = Boolean(initialData);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: '', lastName: '', email: '', phone: '',
            role: 'user', password: '', gender: 'male', address: '', dob: null
        }
    });

    useEffect(() => {
        if (isEditMode && initialData) {
            const nameParts = initialData.name?.split(' ') || [''];
            const lastName = nameParts.pop() || '';
            const firstName = nameParts.join(' ');

            reset({
                firstName: firstName,
                lastName: lastName,
                email: initialData.email || '',
                phone: initialData.phone || '',
                role: initialData.role || 'user',
                password: '', // Luôn bắt đầu với trường mật khẩu trống
                gender: initialData.gender || 'male',
                address: initialData.address || '',
                dob: initialData.dob ? new Date(initialData.dob) : null
            });
        } else {
            reset({
                firstName: '', lastName: '', email: '', phone: '',
                role: 'user', password: '', gender: 'male', address: '', dob: null
            });
        }
    }, [initialData, isEditMode, reset]);

    const processSubmit = (data) => {
        const dataToSubmit = {
            name: `${data.firstName} ${data.lastName}`.trim(),
            email: data.email,
            phone: data.phone,
            role: data.role,
            gender: data.gender,
            address: data.address,
            dob: data.dob ? data.dob.toISOString() : null,
        };

        if (data.password) {
            dataToSubmit.password = data.password;
        }
        onFormSubmit(dataToSubmit);
    };

    return (
        <form onSubmit={handleSubmit(processSubmit)} noValidate>
            <Stack spacing={3}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 5 }}>
                        <FormLabel required>First Name</FormLabel>
                        <Controller
                            name="firstName"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} required fullWidth size="small" error={!!errors.firstName} helperText={errors.firstName?.message} />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}>
                        <FormLabel required>Last Name</FormLabel>
                        <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} required fullWidth size="small" error={!!errors.lastName} helperText={errors.lastName?.message} />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <FormLabel required>Role</FormLabel>
                        <FormControl fullWidth size="small" error={!!errors.role}>
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <Select {...field}>
                                        <MenuItem value="user">User</MenuItem>
                                        <MenuItem value="employee">Employee</MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                    </Select>
                                )}
                            />
                            {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormLabel>Date of Birth</FormLabel>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Controller
                                name="dob"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker {...field} sx={{ width: '100%' }} slotProps={{ textField: { size: 'small', fullWidth: true, error: !!errors.dob, helperText: errors.dob?.message } }} />
                                )}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl error={!!errors.gender}>
                            <FormLabel>Gender</FormLabel>
                            <Controller
                                name="gender"
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup row {...field}>
                                        <FormControlLabel value="male" control={<Radio size="small" />} label="Male" />
                                        <FormControlLabel value="female" control={<Radio size="small" />} label="Female" />
                                        <FormControlLabel value="other" control={<Radio size="small" />} label="Other" />
                                    </RadioGroup>
                                )}
                            />
                            {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormLabel required>Email Address</FormLabel>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} type="email" required fullWidth size="small" error={!!errors.email} helperText={errors.email?.message} />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormLabel>Phone Number</FormLabel>
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} fullWidth size="small" error={!!errors.phone} helperText={errors.phone?.message} />
                            )}
                        />
                    </Grid>

                    {isEditMode && (
                        <Grid size={{ xs: 12 }}>
                            <FormLabel>New Password</FormLabel>
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field} type="password" fullWidth size="small"
                                        placeholder="Leave blank to keep current password"
                                        error={!!errors.password} helperText={errors.password?.message}
                                    />
                                )}
                            />
                        </Grid>
                    )}
                </Grid>

                {!isEditMode && (
                    <Alert severity="info" variant="outlined" sx={{ mt: 1 }}>
                        A secure, random password will be generated and sent to the user's email address.
                    </Alert>
                )}

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