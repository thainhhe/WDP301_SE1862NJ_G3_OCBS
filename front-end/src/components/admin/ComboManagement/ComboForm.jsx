import React, { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, IconButton,
    FormControl, InputLabel, Select, MenuItem, Typography, Checkbox, FormControlLabel, Box
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const itemSchema = z.object({
    name: z.string().min(1, 'Item name is required'),
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});

const comboSchema = z.object({
    name: z.string().min(1, 'Combo name is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.coerce.number().positive('Price must be a positive number'),
    image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    category: z.enum(['combo', 'popcorn', 'drinks', 'snacks']),
    isActive: z.boolean(),
    items: z.array(itemSchema).min(1, 'At least one item is required'),
});


const ComboForm = ({ open, onClose, onSave, combo }) => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(comboSchema),
        defaultValues: {
            name: '',
            description: '',
            price: '',
            image: '',
            items: [{ name: '', quantity: 1 }],
            category: 'combo',
            isActive: true,
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const defaultState = {
            name: '', description: '', price: '', image: '',
            items: [{ name: '', quantity: 1 }], category: 'combo', isActive: true,
        };
        if (combo && open) {
            reset({
                ...combo,
                items: combo.items && combo.items.length ? combo.items : [{ name: '', quantity: 1 }],
            });
            if (combo.image) {
                setImagePreview(combo.image.startsWith('http') ? combo.image : `http://localhost:5000/${combo.image}`);
            } else {
                setImagePreview('');
            }
            setImageFile(null);
        } else {
            reset(defaultState);
            setImagePreview('');
            setImageFile(null);
        }
    }, [combo, open, reset]);

    const handleImageFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const uploadImageFile = async () => {
        if (!imageFile) return null;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('combo', imageFile);
            const response = await fetch('http://localhost:5000/api/upload/combo', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();
            return data.url || data.filePath;
        } finally {
            setUploading(false);
        }
    };

    const handleFormSubmit = async (data) => {
        let imageUrl = data.image;
        if (imageFile) {
            imageUrl = await uploadImageFile();
        }
        onSave({ ...data, image: imageUrl });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>{combo ? 'Edit Combo' : 'Create New Combo'}</DialogTitle>
            <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                <DialogContent>
                    <Grid container spacing={3} sx={{ pt: 1 }}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Combo Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth error={!!errors.category}>
                                <InputLabel>Category</InputLabel>
                                <Controller
                                    name="category"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field} label="Category">
                                            <MenuItem value="combo">Combo</MenuItem>
                                            <MenuItem value="popcorn">Popcorn</MenuItem>
                                            <MenuItem value="drinks">Drinks</MenuItem>
                                            <MenuItem value="snacks">Snacks</MenuItem>
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Description" fullWidth multiline rows={2} error={!!errors.description} helperText={errors.description?.message} />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="price"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Price (VND)" type="number" fullWidth error={!!errors.price} helperText={errors.price?.message} />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 12 }}>
                            <Box mt={2} display="flex" flexDirection="column" alignItems="flex-start">
                                <Button
                                    component="label"
                                    variant="outlined"
                                    disabled={uploading}
                                    startIcon={<CloudUploadIcon />}
                                    sx={{ mb: 1 }}
                                >
                                    {imageFile ? 'Change Image' : 'Upload Image'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={handleImageFileChange}
                                    />
                                </Button>
                                {imagePreview && (
                                    <Box>
                                        <img
                                            src={imagePreview}
                                            alt="Combo Preview"
                                            style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, marginTop: 8 }}
                                        />
                                    </Box>
                                )}
                                {errors.image && (
                                    <Typography color="error.main" variant="caption">
                                        {errors.image.message}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>Items in Combo</Typography>
                            {fields.map((field, index) => (
                                <Grid container spacing={2} key={field.id} alignItems="flex-start" sx={{ mb: 1.5 }}>
                                    {/* Sử dụng cú pháp 'size' cho Grid item lồng nhau */}
                                    <Grid size={{ xs: 12, sm: 7 }}>
                                        <Controller
                                            name={`items.${index}.name`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField {...field} label={`Item ${index + 1} Name`} fullWidth error={!!errors.items?.[index]?.name} helperText={errors.items?.[index]?.name?.message} />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 8, sm: 3 }}>
                                        <Controller
                                            name={`items.${index}.quantity`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField {...field} label="Quantity" type="number" fullWidth InputProps={{ inputProps: { min: 1 } }} error={!!errors.items?.[index]?.quantity} helperText={errors.items?.[index]?.quantity?.message} />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 4, sm: 2 }} sx={{ textAlign: 'right', pt: '12px' }}>
                                        <IconButton onClick={() => remove(index)} color="error" disabled={fields.length <= 1}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}
                            {errors.items && !errors.items.root && <Typography color="error.main" variant="caption">{errors.items.message}</Typography>}
                            <Button startIcon={<AddIcon />} onClick={() => append({ name: '', quantity: 1 })} sx={{ mt: 1 }}>
                                Add Item
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="Is this combo active?" />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={onClose} color="inherit">Cancel</Button>
                    <Button type="submit" variant="contained" disabled={uploading}>Save Combo</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ComboForm;