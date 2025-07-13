"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Monitor,
  Building,
  AlertCircle,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DataTable from "@/components/datatable/DataTable";
import TableToolbar from "@/components/datatable/TableToolbar";
import { theaterService } from "../../services/theaterService"; // Import theaterService
import { branchService } from "../../services/branchService"; // Import branchService

const TheaterForm = ({ theater, branches, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    capacity: 0,
    branchId: "",
    // seatLayout is handled by SeatLayoutEditor, so it's not directly edited here for simplicity
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (theater) {
      setFormData({
        name: theater.name || "",
        capacity: theater.capacity || 0,
        branchId: theater.branch || "", // 'branch' in backend theater model
      });
    }
  }, [theater]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Theater name is required";
    if (formData.capacity <= 0)
      newErrors.capacity = "Capacity must be greater than 0";
    if (!formData.branchId) newErrors.branchId = "Branch is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onCancel();
    } catch (err) {
      console.error("Failed to save theater:", err);
      // Handle error, e.g., show a toast message
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Capacity
        </label>
        <Input
          type="number"
          name="capacity"
          value={formData.capacity}
          onChange={handleChange}
          className="mt-1 block w-full"
        />
        {errors.capacity && (
          <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Branch
        </label>
        <Select
          name="branchId"
          value={formData.branchId}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, branchId: value }))
          }
        >
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Select a Branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch._id} value={branch._id}>
                {branch.name} ({branch.location.city})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.branchId && (
          <p className="text-red-500 text-xs mt-1">{errors.branchId}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-red-600 hover:bg-red-700"
        >
          {loading
            ? "Saving..."
            : theater
            ? "Update Theater"
            : "Create Theater"}
        </Button>
      </div>
    </form>
  );
};

const AdminTheaters = () => {
  const [theaters, setTheaters] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTheater, setEditingTheater] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [theaterToDelete, setTheaterToDelete] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    branchId: "all",
  });

  const fetchTheaters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        name: filters.search,
        branch: filters.branchId !== "all" ? filters.branchId : undefined, // Backend expects 'branch'
      };
      const data = await theaterService.getTheaters(params);
      setTheaters(data);
    } catch (err) {
      console.error("Failed to fetch theaters:", err);
      setError("Failed to load theaters. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchBranches = useCallback(async () => {
    try {
      const data = await branchService.getBranches();
      setBranches(data);
    } catch (err) {
      console.error("Failed to fetch branches for filter:", err);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    fetchTheaters();
  }, [fetchTheaters]);

  const handleCreateTheater = () => {
    setEditingTheater(null);
    setShowFormModal(true);
  };

  const handleEditTheater = (theater) => {
    setEditingTheater(theater);
    setShowFormModal(true);
  };

  const handleDeleteTheater = (theater) => {
    setTheaterToDelete(theater);
    setShowDeleteDialog(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Backend expects 'branchId' for create, 'branch' (populated) for update
      const payload = {
        name: formData.name,
        capacity: Number(formData.capacity),
        branchId: formData.branchId, // For creating
        // For updating, the branch is implicitly handled by the backend
      };

      if (editingTheater) {
        // For update, the backend expects 'branch' as ID, not branchId
        // The `updateTheater` in `theaterController` handles `branch` field directly
        await theaterService.updateTheater(editingTheater._id, {
          name: formData.name,
          capacity: Number(formData.capacity),
          branch: formData.branchId, // Send branch ID for update
        });
        // Show success toast
      } else {
        await theaterService.createTheater(payload);
        // Show success toast
      }
      fetchTheaters();
    } catch (err) {
      console.error("Error saving theater:", err);
      setError(
        `Failed to save theater: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const confirmDeleteTheater = async () => {
    if (!theaterToDelete) return;
    setLoading(true);
    setError(null);
    try {
      await theaterService.deleteTheater(theaterToDelete._id);
      fetchTheaters();
      // Show success toast
    } catch (err) {
      console.error("Error deleting theater:", err);
      setError(
        `Failed to delete theater: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
      setTheaterToDelete(null);
    }
  };

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (info) => (
        <div className="font-medium text-red-600">{info.getValue()}</div>
      ),
    },
    {
      header: "Branch",
      accessorKey: "branch.name", // Assuming branch is populated
      cell: (info) => info.getValue() || "N/A",
    },
    {
      header: "Capacity",
      accessorKey: "capacity",
      cell: (info) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1 text-gray-500" />
          {info.getValue()} seats
        </div>
      ),
    },
    {
      header: "Seat Layout",
      accessorKey: "seatLayout",
      cell: (info) => (info.getValue() ? info.getValue().name : "Not set"),
    },
    {
      header: "Actions",
      id: "actions",
      cell: (info) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditTheater(info.row.original)}
          >
            <Edit className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteTheater(info.row.original)}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-3xl font-bold text-gray-800 flex items-center">
            <Monitor className="mr-3 h-8 w-8 text-red-600" /> Theater Management
          </CardTitle>
          <Button
            onClick={handleCreateTheater}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Theater
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TableToolbar>
            <div className="flex-1 flex space-x-2">
              <Input
                placeholder="Search theaters by name..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="max-w-sm"
              />
              <Select
                value={filters.branchId}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, branchId: value }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch._id} value={branch._id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TableToolbar>

          {loading && theaters.length === 0 ? (
            <div className="text-center py-8">Loading theaters...</div>
          ) : theaters.length > 0 ? (
            <DataTable columns={columns} data={theaters} />
          ) : (
            <Card className="text-center py-10 border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center">
                <div className="text-gray-500 mb-4">
                  <Monitor className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No theaters found
                </h3>
                <p className="text-gray-500 mb-4">
                  {filters.search || filters.branchId !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "Get started by adding your first theater."}
                </p>
                <Button
                  onClick={handleCreateTheater}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Theater
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingTheater ? "Edit Theater" : "Create New Theater"}
            </DialogTitle>
            <DialogDescription>
              {editingTheater
                ? "Update details for this theater."
                : "Fill in the details to create a new theater."}
            </DialogDescription>
          </DialogHeader>
          <TheaterForm
            theater={editingTheater}
            branches={branches} // Pass branches to the form
            onSubmit={handleFormSubmit}
            onCancel={() => setShowFormModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Theater</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the theater "
              {theaterToDelete?.name}"? This action cannot be undone and will
              delete all associated seat layouts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTheater}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTheaters;
