import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
    Grid, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel
} from "@mui/material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// Zod validation schema
const voucherSchema = z.object({
    code: z.string().min(1, "Voucher code is required"),
    description: z.string().optional(),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.coerce.number().positive("Discount value must be positive"),
    usageLimit: z.coerce.number().int().positive("Usage limit must be a positive integer"),
    startDate: z.date({ required_error: "Start date is required" }),
    endDate: z.date({ required_error: "End date is required" }),
    minPurchase: z.coerce.number().min(0).optional().nullable(),
    maxDiscount: z.coerce.number().min(0).optional().nullable(),
    isActive: z.boolean(),
}).refine(data => {
    if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
    }
    return true;
}, {
    message: "End date cannot be before start date",
    path: ["endDate"],
});

const VoucherForm = ({ voucher, onSave, onCancel }) => {
    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(voucherSchema),
        defaultValues: {
            code: "",
            description: "",
            discountType: "percentage",
            discountValue: "",
            minPurchase: "",
            maxDiscount: "",
            startDate: null,
            endDate: null,
            usageLimit: "",
            isActive: true,
        }
    });

    const startDateValue = watch("startDate");

    useEffect(() => {
        const defaultValues = {
            code: "", description: "", discountType: "percentage", discountValue: "",
            minPurchase: "", maxDiscount: "", startDate: null, endDate: null,
            usageLimit: "", isActive: true,
        };
        if (voucher) {
            reset({
                ...voucher,
                startDate: voucher.startDate ? new Date(voucher.startDate) : null,
                endDate: voucher.endDate ? new Date(voucher.endDate) : null,
            });
        } else {
            reset(defaultValues);
        }
    }, [voucher, reset]);

    const handleFormSubmit = (data) => {
        onSave(data);
    };

    return (
        <Dialog open onClose={onCancel} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                {voucher ? "Edit Voucher" : "Create New Voucher"}
            </DialogTitle>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="code"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Voucher Code" fullWidth required autoFocus error={!!errors.code} helperText={errors.code?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth error={!!errors.discountType}>
                                    <InputLabel>Discount Type</InputLabel>
                                    <Controller
                                        name="discountType"
                                        control={control}
                                        render={({ field }) => (
                                            <Select {...field} label="Discount Type">
                                                <MenuItem value="percentage">Percentage (%)</MenuItem>
                                                <MenuItem value="fixed">Fixed Amount</MenuItem>
                                            </Select>
                                        )}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="discountValue"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Discount Value" type="number" fullWidth required error={!!errors.discountValue} helperText={errors.discountValue?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker {...field} label="Start Date" sx={{ width: '100%' }} slotProps={{ textField: { required: true, error: !!errors.startDate, helperText: errors.startDate?.message } }} />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="endDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker {...field} label="End Date" sx={{ width: '100%' }} minDate={startDateValue} slotProps={{ textField: { required: true, error: !!errors.endDate, helperText: errors.endDate?.message } }} />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="usageLimit"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Usage Limit" type="number" fullWidth required error={!!errors.usageLimit} helperText={errors.usageLimit?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="minPurchase"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Minimum Purchase (VND)" type="number" fullWidth error={!!errors.minPurchase} helperText={errors.minPurchase?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="maxDiscount"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Maximum Discount (VND)" type="number" fullWidth error={!!errors.maxDiscount} helperText={errors.maxDiscount?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Description" fullWidth multiline rows={3} error={!!errors.description} helperText={errors.description?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="isActive"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="Activate voucher" />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px', justifyContent: 'flex-start' }}>
                    <Button type="submit" variant="contained" sx={{ minWidth: 100 }}>
                        Save
                    </Button>
                    <Button onClick={onCancel} color="inherit" sx={{ minWidth: 100, ml: 1 }}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default VoucherForm;