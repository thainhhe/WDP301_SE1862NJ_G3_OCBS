import { useState, useEffect, useCallback } from "react"
import { Plus, Edit, Trash2, Eye, Monitor, Building } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import TheaterForm from "./TheaterForm"
import SeatLayoutViewer from "./SeatLayoutViewer"
import { theaterService } from "@/services/theaterService"
import { branchService } from "@/services/branchService"
import { seatService } from "@/services/seatService"
import { toast } from "react-toastify"

// Helper component for displaying the table of theaters
const TheatersTable = ({ theaters, onEdit, onDelete, onViewLayout }) => {
    if (theaters.length === 0) {
        return (
            <div className="text-center py-10 border-2 border-dashed rounded-lg bg-gray-50/50">
                <p className="text-gray-500">No theaters found for this branch.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Theater Name</TableHead>
                        <TableHead>Seat Layout</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {theaters.map((theater) => (
                        <TableRow key={theater._id}>
                            <TableCell className="font-medium">{theater.name}</TableCell>
                            <TableCell>
                                {theater.seatLayout ? (
                                    <span className="flex items-center text-green-600">
                                        <Eye className="w-4 h-4 mr-2" /> Configured
                                    </span>
                                ) : (
                                    <span className="text-orange-500">Not Set</span>
                                )}
                            </TableCell>
                            <TableCell>{new Date(theater.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                    {theater.seatLayout && (
                                        <Button variant="outline" size="sm" onClick={() => onViewLayout(theater)}>
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <Button variant="outline" size="sm" onClick={() => onEdit(theater)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => onDelete(theater)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

const TheaterManagement = () => {
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [theaters, setTheaters] = useState([]);
    const [seatLayouts, setSeatLayouts] = useState([]);

    const [loading, setLoading] = useState({ branches: true, theaters: false });
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLayoutViewerOpen, setIsLayoutViewerOpen] = useState(false);

    const [editingTheater, setEditingTheater] = useState(null);
    const [theaterToDelete, setTheaterToDelete] = useState(null);
    const [viewingLayout, setViewingLayout] = useState(null);

    const fetchBranches = useCallback(async () => {
        setLoading(prev => ({ ...prev, branches: true }));
        try {
            const data = await branchService.getBranches();
            setBranches(data.branches || data || []);
        } catch (err) {
            toast.error("Could not fetch branches.");
        } finally {
            setLoading(prev => ({ ...prev, branches: false }));
        }
    }, []);

    const fetchTheatersForBranch = useCallback(async (branchId) => {
        if (!branchId) {
            setTheaters([]);
            return;
        }
        setLoading(prev => ({ ...prev, theaters: true }));
        try {
            const data = await theaterService.getTheatersByBranch(branchId);
            setTheaters(data);
        } catch (err) {
            toast.error("Could not fetch theaters for the selected branch.");
            setTheaters([]);
        } finally {
            setLoading(prev => ({ ...prev, theaters: false }));
        }
    }, []);

    const fetchAllLayouts = useCallback(async () => {
        try {
            const data = await seatService.getSeatLayouts();
            setSeatLayouts(data.seatLayouts || []);
        } catch (err) {
            console.error("Could not fetch all seat layouts for viewer.");
        }
    }, []);

    useEffect(() => {
        fetchBranches();
        fetchAllLayouts();
    }, [fetchBranches, fetchAllLayouts]);

    const handleBranchChange = (branchId) => {
        setSelectedBranch(branchId);
        fetchTheatersForBranch(branchId);
    };

    const handleAddTheater = () => {
        setEditingTheater(null);
        setIsFormModalOpen(true);
    };

    const handleEditTheater = (theater) => {
        setEditingTheater(theater);
        setIsFormModalOpen(true);
    };

    const handleDeleteTheater = (theater) => {
        setTheaterToDelete(theater);
        setIsDeleteModalOpen(true);
    };

    const handleViewLayout = (theater) => {
        const layout = seatLayouts.find(l => l._id === theater.seatLayout);
        setViewingLayout(layout);
        setIsLayoutViewerOpen(true);
    };

    const confirmDelete = async () => {
        if (!theaterToDelete) return;
        try {
            await theaterService.deleteTheater(theaterToDelete._id);
            toast.success(`Theater "${theaterToDelete.name}" has been deleted.`);
            setIsDeleteModalOpen(false);
            setTheaterToDelete(null);
            fetchTheatersForBranch(selectedBranch);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete theater.");
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            const payload = editingTheater ? formData : { ...formData, branchId: selectedBranch };
            if (editingTheater) {
                await theaterService.updateTheater(editingTheater._id, payload);
                toast.success("Theater updated successfully!");
            } else {
                await theaterService.createTheater(payload);
                toast.success("New theater created successfully!");
            }
            setIsFormModalOpen(false);
            fetchTheatersForBranch(selectedBranch);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save the theater.");
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                            <Monitor className="mr-3 h-7 w-7" />
                            Theater Management
                        </CardTitle>
                        <p className="text-gray-500 mt-1">Manage theaters within your cinema branches.</p>
                    </div>
                    <Button onClick={handleAddTheater} disabled={!selectedBranch || loading.theaters}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Theater
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 max-w-sm">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select a Branch to Begin
                        </label>
                        <Select onValueChange={handleBranchChange} value={selectedBranch}>
                            <SelectTrigger>
                                <SelectValue placeholder={loading.branches ? "Loading branches..." : "Choose a branch..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map(branch => (
                                    <SelectItem key={branch._id} value={branch._id}>{branch.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedBranch ? (
                        <TheatersTable
                            theaters={theaters}
                            isLoading={loading.theaters}
                            onEdit={handleEditTheater}
                            onDelete={handleDeleteTheater}
                            onViewLayout={handleViewLayout}
                        />
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
                            <Building size={48} className="mx-auto text-gray-400" />
                            <p className="mt-4 text-lg font-medium text-gray-600">
                                Please select a branch
                            </p>
                            <p className="text-gray-500">Theaters for the selected branch will appear here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTheater ? "Edit Theater" : "Create New Theater"}</DialogTitle>
                    </DialogHeader>
                    <TheaterForm
                        theater={editingTheater}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsFormModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Are you sure you want to delete "{theaterToDelete?.name}"? This action cannot be undone.
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isLayoutViewerOpen} onOpenChange={setIsLayoutViewerOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Seat Layout: {viewingLayout?.name || 'Details'}</DialogTitle>
                    </DialogHeader>
                    {viewingLayout ? <SeatLayoutViewer layout={viewingLayout} /> : <p>Loading layout...</p>}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default TheaterManagement;