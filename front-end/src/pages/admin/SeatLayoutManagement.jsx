"use client";

import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Users,
  Crown,
  Heart,
  Monitor,
} from "lucide-react";
import SeatLayoutEditor from "../../components/admin/SeatLayoutEditor";
import { seatService, theaterService } from "../../services/seatService";
import { branchService } from "../../services/branchService";

const SeatLayoutManagement = () => {
  const [layouts, setLayouts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingLayout, setEditingLayout] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [layoutToDelete, setLayoutToDelete] = useState(null);
  const [filters, setFilters] = useState({
    branchId: "all",
    theaterId: "all",
    search: "",
    isActive: "all",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchLayouts();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [branchesData, layoutsData] = await Promise.all([
        branchService.getBranches({ limit: 100 }),
        seatService.getSeatLayouts({ limit: 100 }),
      ]);
      console.log("Branches data:", branchesData);
      setBranches(branchesData.branches || branchesData || []);
      setLayouts(layoutsData.seatLayouts || layoutsData || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchLayouts = async () => {
    try {
      const params = {};
      if (filters.branchId !== "all") params.branch = filters.branchId;
      if (filters.theaterId !== "all") params.theater = filters.theaterId;
      if (filters.isActive !== "all")
        params.isActive = filters.isActive === "true";
      if (filters.search.trim()) params.search = filters.search.trim();

      const data = await seatService.getSeatLayouts(params);
      setLayouts(data.seatLayouts || data || []);
    } catch (error) {
      console.error("Error fetching layouts:", error);
      setError("Failed to fetch seat layouts");
    }
  };

  const fetchTheatersByBranch = async (branchId) => {
    try {
      if (!branchId || branchId === "all") {
        setTheaters([]);
        return;
      }
      const data = await theaterService.getTheatersByBranch(branchId);
      setTheaters(data || []);
    } catch (error) {
      console.error("Error fetching theaters:", error);
      setTheaters([]);
    }
  };

  const handleCreateLayout = () => {
    setEditingLayout(null);
    setShowEditor(true);
  };

  const handleEditLayout = (layout) => {
    setEditingLayout(layout);
    setShowEditor(true);
  };

  const handleDeleteLayout = (layout) => {
    setLayoutToDelete(layout);
    setShowDeleteDialog(true);
  };

  const confirmDeleteLayout = async () => {
    try {
      await seatService.deleteSeatLayout(layoutToDelete._id);
      setSuccess("Seat layout deleted successfully!");
      setShowDeleteDialog(false);
      setLayoutToDelete(null);
      await fetchLayouts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.message || "Failed to delete seat layout");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSaveLayout = async (layoutData) => {
    try {
      if (editingLayout) {
        await seatService.updateSeatLayout(editingLayout._id, layoutData);
        setSuccess("Seat layout updated successfully!");
      } else {
        await seatService.createSeatLayout(layoutData);
        setSuccess("Seat layout created successfully!");
      }
      setShowEditor(false);
      setEditingLayout(null);
      await fetchLayouts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.message || "Failed to save seat layout");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleGenerateSeats = async (layout) => {
    try {
      await seatService.generateSeatsFromLayout(layout._id);
      setSuccess(`Seats generated successfully for ${layout.name}!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.message || "Failed to generate seats");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (key === "branchId") {
      setFilters((prev) => ({ ...prev, theaterId: "all" }));
      fetchTheatersByBranch(value);
    }
  };

  const calculateTotalSeats = (layout) => {
    const totalPossible = layout.rows * layout.seatsPerRow;
    const disabled = layout.disabledSeats?.length || 0;
    return totalPossible - disabled;
  };

  const calculateSeatTypes = (layout) => {
    const vipSeats = (layout.vipRows?.length || 0) * layout.seatsPerRow;
    const coupleSeats =
      layout.coupleSeats?.reduce((total, range) => {
        return total + (range.endSeat - range.startSeat + 1);
      }, 0) || 0;
    const standardSeats = calculateTotalSeats(layout) - vipSeats - coupleSeats;
    return { standard: standardSeats, vip: vipSeats, couple: coupleSeats };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seat layouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Seat Layout Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage seat layouts for theaters
          </p>
        </div>
        <Button
          onClick={handleCreateLayout}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Layout
        </Button>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch
              </label>
              <Select
                value={filters.branchId}
                onValueChange={(value) => handleFilterChange("branchId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch._id} value={branch._id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theater
              </label>
              <Select
                value={filters.theaterId}
                onValueChange={(value) =>
                  handleFilterChange("theaterId", value)
                }
                disabled={filters.branchId === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All theaters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All theaters</SelectItem>
                  {theaters.map((theater) => (
                    <SelectItem key={theater._id} value={theater._id}>
                      {theater.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={filters.isActive}
                onValueChange={(value) => handleFilterChange("isActive", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search layouts..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layouts Grid */}
      {layouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {layouts.map((layout) => {
            const totalSeats = calculateTotalSeats(layout);
            const seatTypes = calculateSeatTypes(layout);

            return (
              <Card
                key={layout._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {layout.name}
                      </CardTitle>
                      <div className="text-sm text-gray-600 mt-1">
                        {layout.branch?.name} - {layout.theater?.name}
                      </div>
                    </div>
                    <Badge variant={layout.isActive ? "default" : "secondary"}>
                      {layout.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Dimensions:
                      </span>
                      <div className="text-gray-600">
                        {layout.rows} rows × {layout.seatsPerRow} seats
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Total Seats:
                      </span>
                      <div className="text-gray-600">{totalSeats}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Seat Types:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {seatTypes.standard > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {seatTypes.standard} Standard
                        </Badge>
                      )}
                      {seatTypes.vip > 0 && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-yellow-50 text-yellow-700"
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          {seatTypes.vip} VIP
                        </Badge>
                      )}
                      {seatTypes.couple > 0 && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-pink-50 text-pink-700"
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          {seatTypes.couple} Couple
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-center text-gray-600 mb-2 flex items-center justify-center">
                      <Monitor className="w-3 h-3 mr-1" />
                      SCREEN
                    </div>
                    <div className="space-y-1">
                      {layout.rowLabels?.slice(0, 3).map((row, rowIndex) => (
                        <div
                          key={row}
                          className="flex justify-center space-x-1"
                        >
                          {Array.from({
                            length: Math.min(8, layout.seatsPerRow),
                          }).map((_, seatIndex) => {
                            const seatNumber = seatIndex + 1;
                            const isVip = layout.vipRows?.includes(row);
                            const isCouple = layout.coupleSeats?.some(
                              (range) =>
                                range.row === row &&
                                seatNumber >= range.startSeat &&
                                seatNumber <= range.endSeat
                            );
                            const isDisabled = layout.disabledSeats?.some(
                              (seat) =>
                                seat.row === row && seat.number === seatNumber
                            );

                            let seatColor = "bg-green-200";
                            if (isDisabled) seatColor = "bg-gray-300";
                            else if (isVip) seatColor = "bg-yellow-200";
                            else if (isCouple) seatColor = "bg-pink-200";

                            return (
                              <div
                                key={seatIndex}
                                className={`w-2 h-2 rounded-sm ${seatColor}`}
                              ></div>
                            );
                          })}
                          {layout.seatsPerRow > 8 && (
                            <div className="text-xs text-gray-400">...</div>
                          )}
                        </div>
                      ))}
                      {layout.rows > 3 && (
                        <div className="text-xs text-center text-gray-400">
                          ...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(layout.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditLayout(layout)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteLayout(layout)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleGenerateSeats(layout)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Generate Seats
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500 mb-4">
              <Monitor className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No seat layouts found
            </h3>
            <p className="text-gray-500 mb-4">
              {filters.search ||
              filters.branchId !== "all" ||
              filters.theaterId !== "all"
                ? "Try adjusting your filters to see more results."
                : "Get started by creating your first seat layout."}
            </p>
            <Button
              onClick={handleCreateLayout}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Layout
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="z-[9998]">
          <DialogHeader>
            <DialogTitle>Delete Seat Layout</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the seat layout "
              {layoutToDelete?.name}"? This action cannot be undone and will
              also delete all associated seats.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteLayout}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal for SeatLayoutEditor */}
      {showEditor && (
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden z-[9999]">
            <DialogHeader className="pb-4">
              <DialogTitle>
                {editingLayout ? "Edit Seat Layout" : "Create New Seat Layout"}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[calc(95vh-120px)] overflow-y-auto pr-2">
              <SeatLayoutEditor
                layout={editingLayout}
                branches={branches}
                onSave={handleSaveLayout}
                onCancel={() => {
                  setShowEditor(false);
                  setEditingLayout(null);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SeatLayoutManagement;
