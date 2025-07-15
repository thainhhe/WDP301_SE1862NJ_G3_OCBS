import React, {useState, useEffect} from 'react';
import {
    Box, Typography, Button, Paper, Grid, CircularProgress, Alert, IconButton, Card, CardMedia, CardContent, CardActions
} from '@mui/material';
import {Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon} from '@mui/icons-material';
import {comboService} from '../../services/comboService';
import ComboForm from '../../components/admin/ComboForm.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';

const AdminCombos = () => {
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCombo, setEditingCombo] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [comboToDelete, setComboToDelete] = useState(null);

    useEffect(() => {
        fetchCombos();
    }, []);

    const fetchCombos = async () => {
        try {
            setLoading(true);
            const data = await comboService.getAdminCombos();
            setCombos(data || []);
            setError('');
        } catch (err) {
            setError('Failed to fetch combos. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingCombo(null);
        setShowForm(true);
    };

    const handleEdit = (combo) => {
        setEditingCombo(combo);
        setShowForm(true);
    };

    const handleDelete = (combo) => {
        setComboToDelete(combo);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!comboToDelete) return;
        try {
            await comboService.deleteCombo(comboToDelete._id);
            setShowDeleteDialog(false);
            fetchCombos();
        } catch (err) {
            setError('Failed to delete combo.');
        } finally {
            setComboToDelete(null);
        }
    };

    const handleFormSubmit = async (comboData) => {
        try {
            if (editingCombo) {
                await comboService.updateCombo(editingCombo._id, comboData);
            } else {
                await comboService.createCombo(comboData);
            }
            setShowForm(false);
            setEditingCombo(null);
            fetchCombos();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save combo.');
        }
    };

    if (loading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}><CircularProgress/></Box>;
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Combo Management</Typography>
            <Button variant="contained" startIcon={<AddIcon/>} onClick={handleCreate} sx={{mb: 3}}>
                Add New Combo
            </Button>

            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

            <Grid container spacing={3}>
                {combos.map((combo) => (
                    <Grid item key={combo._id} size={{xs: 12, sm: 6, md: 4}}>
                        <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                            <CardMedia
                                component="img"
                                height="160"
                                image={combo.image || 'https://via.placeholder.com/300x160?text=No+Image'}
                                alt={combo.name}
                            />
                            <CardContent sx={{flexGrow: 1}}>
                                <Typography gutterBottom variant="h5" component="div" fontWeight="bold">
                                    {combo.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {combo.description}
                                </Typography>
                                <Typography variant="h6" color="primary" sx={{mt: 2}}>
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(combo.price)}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{justifyContent: 'flex-end'}}>
                                <IconButton onClick={() => handleEdit(combo)}><EditIcon/></IconButton>
                                <IconButton onClick={() => handleDelete(combo)}><DeleteIcon/></IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {showForm && (
                <ComboForm
                    open={showForm}
                    onClose={() => setShowForm(false)}
                    onSave={handleFormSubmit}
                    combo={editingCombo}
                />
            )}

            {/* Cách gọi ConfirmDialog bây giờ sẽ đúng */}
            <ConfirmDialog
                open={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title="Delete Combo"
                message={`Are you sure you want to delete the combo "${comboToDelete?.name}"?`}
            />
        </Box>
    );
};

export default AdminCombos;