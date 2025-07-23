import React, {useState, useEffect} from "react";
import {Box, Typography, Button, Paper, Grid, CircularProgress, Alert, IconButton} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ConfirmationNumber as VoucherIcon
} from "@mui/icons-material";
import {voucherService} from "@services/voucherService.js";
import VoucherForm from "@components/admin/VoucherForm.jsx";
import ConfirmDialog from "@components/ui/ConfirmDialog";

const AdminVouchers = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [voucherToDelete, setVoucherToDelete] = useState(null);
    const [alert, setAlert] = useState({show: false, message: "", severity: "success"});

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const data = await voucherService.getVouchers();
            setVouchers(data.vouchers || []);
        } catch (error) {
            showAlert("Failed to fetch vouchers.", "error");
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (message, severity = "success") => {
        setAlert({show: true, message, severity});
        setTimeout(() => setAlert({show: false, message: "", severity: "success"}), 3000);
    };

    const handleCreate = () => {
        setEditingVoucher(null);
        setShowForm(true);
    };

    const handleEdit = (voucher) => {
        setEditingVoucher(voucher);
        setShowForm(true);
    };

    const handleDelete = (voucher) => {
        setVoucherToDelete(voucher);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            await voucherService.deleteVoucher(voucherToDelete._id);
            showAlert("Voucher deleted successfully");
            fetchVouchers();
        } catch (error) {
            showAlert("Failed to delete voucher", "error");
        } finally {
            setShowDeleteDialog(false);
            setVoucherToDelete(null);
        }
    };

    const handleFormSubmit = async (voucherData) => {
        try {
            if (editingVoucher) {
                await voucherService.updateVoucher(editingVoucher._id, voucherData);
                showAlert("Voucher updated successfully");
            } else {
                await voucherService.createVoucher(voucherData);
                showAlert("Voucher created successfully");
            }
            setShowForm(false);
            fetchVouchers();
        } catch (error) {
            showAlert(error.response?.data?.message || "Failed to save voucher", "error");
        }
    };

    return (
        <Box>
            {alert.show && <Alert severity={alert.severity} sx={{mb: 2}}>{alert.message}</Alert>}
            <Typography variant="h4" fontWeight="bold" gutterBottom>Voucher Management</Typography>
            <Button variant="contained" startIcon={<AddIcon/>} onClick={handleCreate} sx={{mb: 3}}>
                Add New Voucher
            </Button>

            {loading ? (
                <CircularProgress/>
            ) : (
                <Grid container spacing={3}>
                    {vouchers.map((voucher) => (
                        <Grid item size={{xs: 12, sm: 6, md: 4}} key={voucher._id}>
                            <Paper elevation={2} sx={{p: 2, display: "flex", flexDirection: "column", height: "100%"}}>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <VoucherIcon color="primary" sx={{mr: 1.5}}/>
                                    <Typography variant="h6" fontWeight="bold">{voucher.code}</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary"
                                            sx={{flexGrow: 1}}>{voucher.description}</Typography>
                                <Box sx={{
                                    mt: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Typography variant="subtitle1" color="primary">
                                        {voucher.discountType === 'percentage' ? `${voucher.discountValue}% OFF` : `${voucher.discountValue.toLocaleString()} VND OFF`}
                                    </Typography>
                                    <Box>
                                        <IconButton onClick={() => handleEdit(voucher)}><EditIcon/></IconButton>
                                        <IconButton onClick={() => handleDelete(voucher)}><DeleteIcon/></IconButton>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            {showForm && (
                <VoucherForm
                    voucher={editingVoucher}
                    onSave={handleFormSubmit}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {showDeleteDialog && (
                <ConfirmDialog
                    title="Delete Voucher"
                    message={`Are you sure you want to delete the voucher "${voucherToDelete?.code}"?`}
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteDialog(false)}
                />
            )}
        </Box>
    );
};

export default AdminVouchers;