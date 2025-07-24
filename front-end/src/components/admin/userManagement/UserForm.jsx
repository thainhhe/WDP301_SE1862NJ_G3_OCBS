import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    TextField, Button, Stack, FormControl, Select, MenuItem, Box,
    Grid, Alert, RadioGroup, FormControlLabel, Radio, Typography,
    FormHelperText, Autocomplete, Paper, Divider
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import provinceService from '../../../services/provinceService';

// Component con để hiển thị label và dấu sao đỏ
const FormLabel = ({ children, required = false }) => (
    <Typography
        variant="subtitle2"
        sx={{
            mb: 0.5,
            fontWeight: '600',
            color: 'text.primary',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        }}
    >
        {children}
        {required && <span style={{ color: '#D32F2F', marginLeft: '2px' }}> *</span>}
    </Typography>
);

// Zod validation schema
const userSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    phone: z.string().optional().or(z.literal('')),
    role: z.enum(['customer', 'employee', 'admin']),
    password: z.string().optional().or(z.literal('')).refine(val => !val || val.length >= 6, {
        message: 'Password must be at least 6 characters'
    }),
    gender: z.enum(['male', 'female', 'other']),
    address: z.string().optional(),
    dob: z.date().optional().nullable(),
    province: z.string().min(1, 'Province is required'),
    city: z.string().min(1, 'City is required'),
});

const UserForm = ({ onFormSubmit, onCancel, initialData = null, isSubmitting }) => {
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);

    const isEditMode = Boolean(initialData);

    useEffect(() => {
        // Fetch provinces when component mounts
        const fetchProvinces = async () => {
            try {
                const data = await provinceService.getProvinces();
                setProvinces(data);
            } catch (error) {
                console.error('Failed to fetch provinces:', error);
            }
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        // Fetch cities when province changes
        const fetchCities = async () => {
            if (selectedProvince) {
                try {
                    const data = await provinceService.getDistricts(selectedProvince.code);
                    setCities(data.districts);
                } catch (error) {
                    console.error('Failed to fetch cities:', error);
                }
            } else {
                setCities([]);
            }
        };
        fetchCities();
    }, [selectedProvince]);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: '', lastName: '', email: '', phone: '',
            role: 'customer', password: '', gender: 'male',
            address: '', dob: null, province: '', city: ''
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
                password: '',
                gender: initialData.gender || 'male',
                address: initialData.address || '',
                dob: initialData.dob ? new Date(initialData.dob) : null,
                province: initialData.province || '',
                city: initialData.city || ''
            });

            // Set selected province if editing
            if (initialData.province) {
                const province = provinces.find(p => p.name === initialData.province);
                setSelectedProvince(province);
            }
        }
    }, [initialData, isEditMode, reset, provinces]);

    const processSubmit = (data) => {
        const dataToSubmit = {
            name: `${data.firstName} ${data.lastName}`.trim(),
            email: data.email,
            phone: data.phone,
            role: data.role,
            gender: data.gender,
            address: data.address,
            dob: data.dob ? data.dob.toISOString() : null,
            province: data.province,
            city: data.city
        };

        if (data.password) {
            dataToSubmit.password = data.password;
        }
        onFormSubmit(dataToSubmit);
    };

    return (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <form onSubmit={handleSubmit(processSubmit)} noValidate>
                <Stack spacing={3}>
                    <Typography variant="h6" sx={{ mb: 1, color: 'primary.main', fontWeight: 600 }}>
                        {isEditMode ? 'Edit User Information' : 'Create New User'}
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Basic Information
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item size={{xs: 12, sm: 4}}>
                                <FormLabel required>First Name</FormLabel>
                                <Controller
                                    name="firstName"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            required
                                            fullWidth
                                            size="small"
                                            error={!!errors.firstName}
                                            helperText={errors.firstName?.message}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 1
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item size={{xs: 12, sm: 4}}>
                                <FormLabel required>Last Name</FormLabel>
                                <Controller
                                    name="lastName"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            required
                                            fullWidth
                                            size="small"
                                            error={!!errors.lastName}
                                            helperText={errors.lastName?.message}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 1
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item size={{xs: 12, sm: 4}}>
                                <FormLabel required>Role</FormLabel>
                                <FormControl
                                    fullWidth
                                    size="small"
                                    error={!!errors.role}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1
                                        }
                                    }}
                                >
                                    <Controller
                                        name="role"
                                        control={control}
                                        render={({ field }) => (
                                            <Select {...field}>
                                                <MenuItem value="customer">Customer</MenuItem>
                                                <MenuItem value="employee">Employee</MenuItem>
                                                <MenuItem value="admin">Admin</MenuItem>
                                            </Select>
                                        )}
                                    />
                                    {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Personal Details
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item size={{xs: 12, md: 6}}>
                                <FormLabel required>Date of Birth</FormLabel>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <Controller
                                        name="dob"
                                        control={control}
                                        render={({ field }) => (
                                            <DatePicker
                                                {...field}
                                                sx={{ width: '100%' }}
                                                slotProps={{
                                                    textField: {
                                                        size: 'small',
                                                        fullWidth: true,
                                                        error: !!errors.dob,
                                                        helperText: errors.dob?.message,
                                                        sx: {
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 1
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item size={{xs: 12, md: 6}}>
                                <FormControl error={!!errors.gender}>
                                    <FormLabel required>Gender</FormLabel>
                                    <Controller
                                        name="gender"
                                        control={control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                row
                                                {...field}
                                                sx={{
                                                    '& .MuiRadio-root': {
                                                        color: 'primary.main'
                                                    }
                                                }}
                                            >
                                                <FormControlLabel value="male" control={<Radio size="small" />} label="Male" />
                                                <FormControlLabel value="female" control={<Radio size="small" />} label="Female" />
                                                <FormControlLabel value="other" control={<Radio size="small" />} label="Other" />
                                            </RadioGroup>
                                        )}
                                    />
                                    {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Contact Information
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item size={{xs: 12, md: 6}}>
                                <FormLabel required>Email Address</FormLabel>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="email"
                                            required
                                            fullWidth
                                            size="small"
                                            error={!!errors.email}
                                            helperText={errors.email?.message}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 1
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item size={{xs: 12, md: 6}}>
                                <FormLabel>Phone Number</FormLabel>
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            size="small"
                                            error={!!errors.phone}
                                            helperText={errors.phone?.message}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 1
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Address Information
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item size={{xs: 12, md: 6}}>
                                <FormLabel required>Province</FormLabel>
                                <Controller
                                    name="province"
                                    control={control}
                                    render={({ field }) => (
                                        <Autocomplete
                                            options={provinces}
                                            getOptionLabel={(option) => option.name}
                                            value={selectedProvince}
                                            onChange={(_, newValue) => {
                                                setSelectedProvince(newValue);
                                                field.onChange(newValue ? newValue.name : '');
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    error={!!errors.province}
                                                    helperText={errors.province?.message}
                                                    fullWidth
                                                    size="small"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 1
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item size={{xs: 12, md: 6}}>
                                <FormLabel required>City/District</FormLabel>
                                <Controller
                                    name="city"
                                    control={control}
                                    render={({ field }) => (
                                        <Autocomplete
                                            options={cities}
                                            getOptionLabel={(option) => option.name}
                                            value={cities.find(city => city.name === field.value) || null}
                                            onChange={(_, newValue) => {
                                                field.onChange(newValue ? newValue.name : '');
                                            }}
                                            disabled={!selectedProvince}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    error={!!errors.city}
                                                    helperText={errors.city?.message}
                                                    fullWidth
                                                    size="small"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 1
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    {isEditMode && (
                        <>
                            <Divider />
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                    Security
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item size={{xs: 12}}>
                                        <FormLabel>New Password</FormLabel>
                                        <Controller
                                            name="password"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    type="password"
                                                    fullWidth
                                                    size="small"
                                                    placeholder="Leave blank to keep current password"
                                                    error={!!errors.password}
                                                    helperText={errors.password?.message}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 1
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </>
                    )}

                    {!isEditMode && (
                        <Alert
                            severity="info"
                            variant="outlined"
                            sx={{
                                mt: 1,
                                borderRadius: 1,
                                '& .MuiAlert-icon': {
                                    color: 'primary.main'
                                }
                            }}
                        >
                            A secure, random password will be generated and sent to the user's email address.
                        </Alert>
                    )}

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2,
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        mt: 3
                    }}>
                        <Button
                            onClick={onCancel}
                            disabled={isSubmitting}
                            sx={{
                                borderRadius: 1,
                                textTransform: 'none',
                                px: 3
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{
                                borderRadius: 1,
                                textTransform: 'none',
                                px: 3
                            }}
                        >
                            {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create User')}
                        </Button>
                    </Box>
                </Stack>
            </form>
        </Paper>
    );
};

export default UserForm;

