"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MapPin,
  Clock,
  Film,
  AlertCircle,
  Building,
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
import DataTable from "@/components/datatable/DataTable"; // Assuming you have this component
import TableToolbar from "@/components/datatable/TableToolbar"; // Assuming you have this component
import { branchService } from "../../services/branchService"; // Import branchService

const BranchForm = ({ branch, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: { address: "", city: "" },
    contact: { phone: "", email: "" },
    operatingHours: { open: "09:00", close: "23:00" },
    facilities: [],
    image: "", // Placeholder for image URL/upload
    isActive: true,
  });
  const [newFacility, setNewFacility] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name || "",
        location: branch.location || { address: "", city: "" },
        contact: branch.contact || { phone: "", email: "" },
        operatingHours: branch.operatingHours || {
          open: "09:00",
          close: "23:00",
        },
        facilities: branch.facilities || [],
        image: branch.image || "",
        isActive: branch.isActive !== undefined ? branch.isActive : true,
      });
    }
  }, [branch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData((prev) => ({ ...prev, isActive: e.target.checked }));
  };

  const handleAddFacility = () => {
    if (
      newFacility.trim() &&
      !formData.facilities.includes(newFacility.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        facilities: [...prev.facilities, newFacility.trim()],
      }));
      setNewFacility("");
    }
  };

  const handleRemoveFacility = (facilityToRemove) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((f) => f !== facilityToRemove),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Branch name is required";
    if (!formData.location.city.trim())
      newErrors["location.city"] = "City is required";
    if (!formData.location.address.trim())
      newErrors["location.address"] = "Address is required";
    if (!formData.contact.phone.trim())
      newErrors["contact.phone"] = "Phone is required";
    if (!formData.contact.email.trim())
      newErrors["contact.email"] = "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.contact.email))
      newErrors["contact.email"] = "Invalid email format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onCancel(); // Close form after submission
    } catch (err) {
      console.error("Failed to save branch:", err);
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            City
          </label>
          <Input
            type="text"
            name="location.city"
            value={formData.location.city}
            onChange={handleChange}
            className="mt-1 block w-full"
          />
          {errors["location.city"] && (
            <p className="text-red-500 text-xs mt-1">
              {errors["location.city"]}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <Input
            type="text"
            name="location.address"
            value={formData.location.address}
            onChange={handleChange}
            className="mt-1 block w-full"
          />
          {errors["location.address"] && (
            <p className="text-red-500 text-xs mt-1">
              {errors["location.address"]}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <Input
            type="text"
            name="contact.phone"
            value={formData.contact.phone}
            onChange={handleChange}
            className="mt-1 block w-full"
          />
          {errors["contact.phone"] && (
            <p className="text-red-500 text-xs mt-1">
              {errors["contact.phone"]}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            type="email"
            name="contact.email"
            value={formData.contact.email}
            onChange={handleChange}
            className="mt-1 block w-full"
          />
          {errors["contact.email"] && (
            <p className="text-red-500 text-xs mt-1">
              {errors["contact.email"]}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Opening Time
          </label>
          <Input
            type="time"
            name="operatingHours.open"
            value={formData.operatingHours.open}
            onChange={handleChange}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Closing Time
          </label>
          <Input
            type="time"
            name="operatingHours.close"
            value={formData.operatingHours.close}
            onChange={handleChange}
            className="mt-1 block w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Facilities
        </label>
        <div className="flex space-x-2 mt-1">
          <Input
            type="text"
            value={newFacility}
            onChange={(e) => setNewFacility(e.target.value)}
            placeholder="Add facility..."
            className="flex-grow"
          />
          <Button
            type="button"
            onClick={handleAddFacility}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.facilities.map((facility, index) => (
            <Badge key={index} className="flex items-center space-x-1">
              <span>{facility}</span>
              <button
                type="button"
                onClick={() => handleRemoveFacility(facility)}
                className="ml-1 text-red-400 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <Input
          type="text"
          name="image"
          value={formData.image}
          onChange={handleChange}
          className="mt-1 block w-full"
          placeholder="e.g., /uploads/branches/branch-image.jpg"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">Active</label>
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
          {loading ? "Saving..." : branch ? "Update Branch" : "Create Branch"}
        </Button>
      </div>
    </form>
  );
};

const AdminBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    isActive: "all", // "true", "false", "all"
    city: "all",
  });
  const [availableCities, setAvailableCities] = useState([]);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        name: filters.search,
        location_city: filters.city !== "all" ? filters.city : undefined,
        isActive:
          filters.isActive !== "all" ? filters.isActive === "true" : undefined,
      };
      const data = await branchService.getBranches(params);
      setBranches(data);

      // Extract unique cities for filter dropdown
      const cities = [
        ...new Set(data.map((b) => b.location.city).filter(Boolean)),
      ];
      setAvailableCities(["all", ...cities]);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
      setError("Failed to load branches. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleCreateBranch = () => {
    setEditingBranch(null);
    setShowFormModal(true);
  };

  const handleEditBranch = (branch) => {
    setEditingBranch(branch);
    setShowFormModal(true);
  };

  const handleDeleteBranch = (branch) => {
    setBranchToDelete(branch);
    setShowDeleteDialog(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingBranch) {
        await branchService.updateBranch(editingBranch._id, formData);
        // Show success toast
      } else {
        await branchService.createBranch(formData);
        // Show success toast
      }
      fetchBranches(); // Re-fetch data to update list
    } catch (err) {
      console.error("Error saving branch:", err);
      setError(
        `Failed to save branch: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const confirmDeleteBranch = async () => {
    if (!branchToDelete) return;
    setLoading(true);
    setError(null);
    try {
      await branchService.deleteBranch(branchToDelete._id);
      fetchBranches(); // Re-fetch data
      // Show success toast
    } catch (err) {
      console.error("Error deleting branch:", err);
      setError(
        `Failed to delete branch: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
      setBranchToDelete(null);
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
      header: "Location",
      accessorKey: "location.city",
      cell: (info) => (
        <span>
          {info.row.original.location.address},{" "}
          {info.row.original.location.city}
        </span>
      ),
    },
    {
      header: "Contact",
      accessorKey: "contact.phone",
      cell: (info) => (
        <span>
          {info.row.original.contact.phone}
          <br />
          {info.row.original.contact.email}
        </span>
      ),
    },
    {
      header: "Operating Hours",
      accessorKey: "operatingHours",
      cell: (info) => (
        <span>
          {info.row.original.operatingHours.open} -{" "}
          {info.row.original.operatingHours.close}
        </span>
      ),
    },
    {
      header: "Facilities",
      accessorKey: "facilities",
      cell: (info) => (
        <div className="flex flex-wrap gap-1">
          {info.getValue().map((f, i) => (
            <Badge
              key={i}
              variant="outline"
              className="bg-blue-50 text-blue-700"
            >
              {f}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Active",
      accessorKey: "isActive",
      cell: (info) => (
        <Badge
          variant={info.getValue() ? "success" : "destructive"}
          className={
            info.getValue()
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }
        >
          {info.getValue() ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: (info) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditBranch(info.row.original)}
          >
            <Edit className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteBranch(info.row.original)}
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
            <Building className="mr-3 h-8 w-8 text-red-600" /> Branch Management
          </CardTitle>
          <Button
            onClick={handleCreateBranch}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Branch
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
                placeholder="Search branches by name..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="max-w-sm"
              />
              <Select
                value={filters.city}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, city: value }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by City" />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city === "all" ? "All Cities" : city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.isActive}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, isActive: value }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TableToolbar>

          {loading && branches.length === 0 ? (
            <div className="text-center py-8">Loading branches...</div>
          ) : branches.length > 0 ? (
            <DataTable columns={columns} data={branches} />
          ) : (
            <Card className="text-center py-10 border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center">
                <div className="text-gray-500 mb-4">
                  <Building className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No branches found
                </h3>
                <p className="text-gray-500 mb-4">
                  {filters.search ||
                  filters.isActive !== "all" ||
                  filters.city !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "Get started by adding your first branch."}
                </p>
                <Button
                  onClick={handleCreateBranch}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Branch
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? "Edit Branch" : "Create New Branch"}
            </DialogTitle>
            <DialogDescription>
              {editingBranch
                ? "Update details for this branch."
                : "Fill in the details to create a new branch."}
            </DialogDescription>
          </DialogHeader>
          <BranchForm
            branch={editingBranch}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowFormModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Branch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the branch "{branchToDelete?.name}
              "? This action cannot be undone and may affect associated theaters
              and showtimes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteBranch}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBranches;
