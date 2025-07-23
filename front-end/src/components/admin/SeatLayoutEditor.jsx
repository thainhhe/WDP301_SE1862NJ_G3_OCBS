import {useState, useEffect, useCallback} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {
    Users,
    Crown,
    Heart,
    X,
    Plus,
    Minus,
    Save,
    RotateCcw,
    Monitor,
    Settings,
} from "lucide-react";
import {theaterService} from "@services/theaterService.js";
import {branchService} from "@services/branchService.js";
import {toast} from "react-toastify";

const SeatLayoutEditor = ({
                              layout = null,
                              branches: propBranches,
                              onSave,
                              onCancel,
                          }) => {
    const [formData, setFormData] = useState({
        name: "",
        branch: "",
        theater: "",
        rows: 10,
        seatsPerRow: 12,
        rowLabels: [],
        vipRows: [],
        coupleSeats: [],
        aisleAfterColumns: [4, 8, 12, 16],
        disabledSeats: [],
        isActive: true,
    });
    const [theaters, setTheaters] = useState([]);
    const [selectedTool, setSelectedTool] = useState("standard");
    const [previewSeats, setPreviewSeats] = useState([]);
    const [loading, setLoading] = useState({branches: false, theaters: false, submitting: false});
    const [error, setError] = useState(null);

    // Generate row labels (A, B, C, ...)
    const generateRowLabels = useCallback((numRows) => {
        const labels = [];
        for (let i = 0; i < numRows; i++) {
            labels.push(String.fromCharCode(65 + i));
        }
        return labels;
    }, []);

    const fetchTheatersByBranch = useCallback(async (branchId) => {
        if (!branchId) {
            setTheaters([]);
            return;
        }
        setLoading(prev => ({...prev, theaters: true}));
        try {
            const allTheaters = await theaterService.getTheatersByBranch(branchId);
            const availableTheaters = allTheaters.filter(
                t => !t.seatLayout || (layout && t._id === layout.theater)
            );
            setTheaters(availableTheaters);
        } catch (err) {
            toast.error("Error fetching available theaters.");
            setTheaters([]);
        } finally {
            setLoading(prev => ({...prev, theaters: false}));
        }
    }, [layout]);

    useEffect(() => {
        if (layout) {
            const branchId = layout.branch?._id || layout.branch;
            setFormData(prev => ({
                ...prev,
                name: layout.name || "",
                branch: branchId || "",
                theater: layout.theater?._id || layout.theater || "",
                rows: layout.rows || 10,
                seatsPerRow: layout.seatsPerRow || 12,
                rowLabels: layout.rowLabels || generateRowLabels(layout.rows || 10),
                vipRows: layout.vipRows || [],
                coupleSeats: layout.coupleSeats || [],
                aisleAfterColumns: layout.aisleAfterColumns || [4, 8],
                disabledSeats: layout.disabledSeats || [],
                isActive: layout.isActive !== undefined ? layout.isActive : true,
            }));
            if (branchId) {
                fetchTheatersByBranch(branchId);
            }
        } else {
            setFormData(prev => ({...prev, rowLabels: generateRowLabels(prev.rows)}));
        }
    }, [layout, generateRowLabels, fetchTheatersByBranch]);


    useEffect(() => {
        generatePreviewSeats();
    }, [formData]);

    const generatePreviewSeats = () => {
        const seats = [];

        for (let rowIndex = 0; rowIndex < formData.rows; rowIndex++) {
            const rowLabel =
                formData.rowLabels[rowIndex] || String.fromCharCode(65 + rowIndex);

            for (let seatNum = 1; seatNum <= formData.seatsPerRow; seatNum++) {
                const seat = {
                    id: `${rowLabel}${seatNum}`,
                    row: rowLabel,
                    number: seatNum,
                    type: getSeatType(rowLabel, seatNum),
                    disabled: isSeatDisabled(rowLabel, seatNum),
                };

                seats.push(seat);
            }
        }

        setPreviewSeats(seats);
    };

    const getSeatType = (row, number) => {
        // Check if it's a VIP row
        if (formData.vipRows.includes(row)) {
            return "vip";
        }

        // Check if it's a couple seat
        const coupleRange = formData.coupleSeats.find(
            (range) =>
                range.row === row &&
                number >= range.startSeat &&
                number <= range.endSeat
        );
        if (coupleRange) {
            return "couple";
        }

        return "standard";
    };

    const isSeatDisabled = (row, number) => {
        return formData.disabledSeats.some(
            (seat) => seat.row === row && seat.number === number
        );
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => {
            const newData = {...prev, [field]: value};
            if (field === "branch") {
                newData.theater = '';
                fetchTheatersByBranch(value);
            }
            if (field === "rows") {
                newData.rowLabels = generateRowLabels(value);
            }
            return newData;
        });
    };

    const handleSeatClick = (seat) => {
        const {row, number} = seat;

        switch (selectedTool) {
            case "standard":
                removeFromVipRows(row);
                removeFromCoupleSeats(row, number);
                removeFromDisabledSeats(row, number);
                break;

            case "vip":
                toggleVipRow(row);
                break;

            case "couple":
                toggleCoupleSeat(row, number);
                break;

            case "disabled":
                toggleDisabledSeat(row, number);
                break;
        }
    };

    const toggleVipRow = (row) => {
        setFormData((prev) => ({
            ...prev,
            vipRows: prev.vipRows.includes(row)
                ? prev.vipRows.filter((r) => r !== row)
                : [...prev.vipRows, row],
        }));
    };

    const toggleCoupleSeat = (row, number) => {
        setFormData((prev) => {
            const existingRange = prev.coupleSeats.find(
                (range) =>
                    range.row === row &&
                    number >= range.startSeat &&
                    number <= range.endSeat
            );

            if (existingRange) {
                return {
                    ...prev,
                    coupleSeats: prev.coupleSeats.filter(
                        (range) => range !== existingRange
                    ),
                };
            } else {
                // Add as couple seat (pair with next seat)
                return {
                    ...prev,
                    coupleSeats: [
                        ...prev.coupleSeats,
                        {
                            row,
                            startSeat: number,
                            endSeat: number + 1,
                        },
                    ],
                };
            }
        });
    };

    const toggleDisabledSeat = (row, number) => {
        setFormData((prev) => {
            const exists = prev.disabledSeats.some(
                (seat) => seat.row === row && seat.number === number
            );

            if (exists) {
                return {
                    ...prev,
                    disabledSeats: prev.disabledSeats.filter(
                        (seat) => !(seat.row === row && seat.number === number)
                    ),
                };
            } else {
                return {
                    ...prev,
                    disabledSeats: [...prev.disabledSeats, {row, number}],
                };
            }
        });
    };

    const removeFromVipRows = (row) => {
        setFormData((prev) => ({
            ...prev,
            vipRows: prev.vipRows.filter((r) => r !== row),
        }));
    };

    const removeFromCoupleSeats = (row, number) => {
        setFormData((prev) => ({
            ...prev,
            coupleSeats: prev.coupleSeats.filter(
                (range) =>
                    !(
                        range.row === row &&
                        number >= range.startSeat &&
                        number <= range.endSeat
                    )
            ),
        }));
    };

    const removeFromDisabledSeats = (row, number) => {
        setFormData((prev) => ({
            ...prev,
            disabledSeats: prev.disabledSeats.filter(
                (seat) => !(seat.row === row && seat.number === number)
            ),
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError("Layout name is required");
            return false;
        }

        if (!formData.branch) {
            setError("Branch is required");
            return false;
        }

        if (!formData.theater) {
            setError("Theater is required");
            return false;
        }

        if (formData.rows < 1 || formData.rows > 26) {
            setError("Number of rows must be between 1 and 26");
            return false;
        }

        if (formData.seatsPerRow < 1 || formData.seatsPerRow > 50) {
            setError("Seats per row must be between 1 and 50");
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await onSave(formData);
        } catch (error) {
            setError(error.message || "Failed to save seat layout");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            name: "",
            branch: "",
            theater: "",
            rows: 10,
            seatsPerRow: 12,
            rowLabels: generateRowLabels(10),
            vipRows: [],
            coupleSeats: [],
            aisleAfterColumns: [4, 8],
            disabledSeats: [],
            isActive: true,
        });
        setTheaters([]);
    };

    const getSeatIcon = (seat) => {
        if (seat.disabled) {
            return <X className="w-3 h-3"/>;
        }

        switch (seat.type) {
            case "vip":
                return <Crown className="w-3 h-3"/>;
            case "couple":
                return <Heart className="w-3 h-3"/>;
            default:
                return <Users className="w-3 h-3"/>;
        }
    };

    const getSeatColor = (seat) => {
        if (seat.disabled) {
            return "bg-gray-300 text-gray-600 border-gray-400";
        }

        switch (seat.type) {
            case "vip":
                return "bg-yellow-200 text-yellow-800 border-yellow-400";
            case "couple":
                return "bg-pink-200 text-pink-800 border-pink-400";
            default:
                return "bg-green-200 text-green-800 border-green-400";
        }
    };

    const groupSeatsByRow = () => {
        const grouped = {};
        previewSeats.forEach((seat) => {
            if (!grouped[seat.row]) {
                grouped[seat.row] = [];
            }
            grouped[seat.row].push(seat);
        });
        return grouped;
    };

    const calculateStats = () => {
        const totalSeats =
            formData.rows * formData.seatsPerRow - formData.disabledSeats.length;
        const vipSeats = formData.vipRows.length * formData.seatsPerRow;
        const coupleSeats = formData.coupleSeats.reduce((total, range) => {
            return total + (range.endSeat - range.startSeat + 1);
        }, 0);
        const standardSeats = totalSeats - vipSeats - coupleSeats;

        return {
            total: totalSeats,
            standard: standardSeats,
            vip: vipSeats,
            couple: coupleSeats,
        };
    };

    const groupedSeats = groupSeatsByRow();
    const rowLabels = Object.keys(groupedSeats).sort();
    const stats = calculateStats();

    return (
        <div className="space-y-6 p-4">
            {/* Error Alert */}
            {error && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
            )}

            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Settings className="w-5 h-5 mr-2"/>
                        Basic Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Layout Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Enter layout name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={formData.isActive.toString()}
                                onValueChange={(value) =>
                                    handleInputChange("isActive", value === "true")
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent className="z-[9999]">
                                    <SelectItem value="true">Active</SelectItem>
                                    <SelectItem value="false">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Branch *</label>
                            <Select value={formData.branch}
                                    onValueChange={(value) => handleInputChange("branch", value)}
                                    disabled={!!layout || loading.branches}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loading.branches ? "Loading..." : "Select a branch"}/>
                                </SelectTrigger>
                                <SelectContent className="z-[10000]">
                                    {propBranches.map((branch) => (
                                        <SelectItem key={branch._id} value={branch._id}>{branch.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Theater *</label>
                            <Select value={formData.theater}
                                    onValueChange={(value) => handleInputChange("theater", value)}
                                    disabled={!formData.branch || loading.theaters || !!layout}>
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={loading.theaters ? "Loading..." : "Select an available theater"}/>
                                </SelectTrigger>
                                <SelectContent className="z-[10000]">
                                    {theaters.length > 0 ? (
                                        theaters.map((theater) => (
                                            <SelectItem key={theater._id}
                                                        value={theater._id}>{theater.name}</SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-gray-500">No available theaters.</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Layout Dimensions */}
            <Card>
                <CardHeader>
                    <CardTitle>Layout Dimensions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Number of Rows
                            </label>
                            <div className="flex items-center space-x-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        handleInputChange("rows", Math.max(1, formData.rows - 1))
                                    }
                                >
                                    <Minus className="w-4 h-4"/>
                                </Button>
                                <Input
                                    type="number"
                                    value={formData.rows}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "rows",
                                            Number.parseInt(e.target.value) || 1
                                        )
                                    }
                                    min="1"
                                    max="26"
                                    className="text-center w-20"
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        handleInputChange("rows", Math.min(26, formData.rows + 1))
                                    }
                                >
                                    <Plus className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seats per Row
                            </label>
                            <div className="flex items-center space-x-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        handleInputChange(
                                            "seatsPerRow",
                                            Math.max(1, formData.seatsPerRow - 1)
                                        )
                                    }
                                >
                                    <Minus className="w-4 h-4"/>
                                </Button>
                                <Input
                                    type="number"
                                    value={formData.seatsPerRow}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "seatsPerRow",
                                            Number.parseInt(e.target.value) || 1
                                        )
                                    }
                                    min="1"
                                    max="50"
                                    className="text-center w-20"
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        handleInputChange(
                                            "seatsPerRow",
                                            Math.min(50, formData.seatsPerRow + 1)
                                        )
                                    }
                                >
                                    <Plus className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Editing Tools */}
            <Card>
                <CardHeader>
                    <CardTitle>Seat Types</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {[
                            {
                                id: "standard",
                                label: "Standard",
                                icon: Users,
                                color: "bg-green-100 text-green-800",
                            },
                            {
                                id: "vip",
                                label: "VIP",
                                icon: Crown,
                                color: "bg-yellow-100 text-yellow-800",
                            },
                            {
                                id: "couple",
                                label: "Couple",
                                icon: Heart,
                                color: "bg-pink-100 text-pink-800",
                            },
                            {
                                id: "disabled",
                                label: "Disabled",
                                icon: X,
                                color: "bg-gray-100 text-gray-800",
                            },
                        ].map((tool) => (
                            <Button
                                key={tool.id}
                                variant={selectedTool === tool.id ? "default" : "outline"}
                                onClick={() => setSelectedTool(tool.id)}
                                className={
                                    selectedTool === tool.id ? "bg-red-600 hover:bg-red-700" : ""
                                }
                            >
                                <tool.icon className="w-4 h-4 mr-2"/>
                                {tool.label}
                            </Button>
                        ))}
                    </div>
                    <p className="text-sm text-gray-600">
                        Select a seat type and click on seats to modify them.
                        {selectedTool === "couple" &&
                            " Click on the first seat of a couple pair."}
                    </p>
                </CardContent>
            </Card>

            {/* Seat Map Preview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-center">
                        <Monitor className="w-5 h-5 mr-2"/>
                        SCREEN
                    </CardTitle>
                    <div
                        className="w-full h-2 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full"></div>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="space-y-6 p-4 max-h-[60vh] overflow-y-auto">
                        {rowLabels.map((row) => (
                            <div
                                key={row}
                                className="flex items-center justify-center space-x-1"
                            >
                                {/* Row Label */}
                                <div className="w-8 text-center font-medium text-gray-700">
                                    {row}
                                </div>

                                {/* Seats */}
                                <div className="flex space-x-1">
                                    {groupedSeats[row].map((seat, index) => {
                                        const showAisle = formData.aisleAfterColumns.includes(
                                            seat.number
                                        );

                                        return (
                                            <div key={seat.id} className="flex items-center">
                                                <button
                                                    onClick={() => handleSeatClick(seat)}
                                                    className={`
                            w-6 h-6 rounded border-2 flex items-center justify-center
                            transition-all duration-200 text-xs font-medium
                            cursor-pointer transform hover:scale-110
                            ${getSeatColor(seat)}
                          `}
                                                    title={`${seat.row}${seat.number} - ${seat.type}${
                                                        seat.disabled ? " (disabled)" : ""
                                                    }`}
                                                >
                                                    {getSeatIcon(seat)}
                                                </button>
                                                {showAisle && <div className="w-4"></div>}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Row Label (Right) */}
                                <div className="w-8 text-center font-medium text-gray-700">
                                    {row}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Layout Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-blue-600">
                                {stats.total}
                            </div>
                            <div className="text-sm text-gray-600">Total Seats</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.standard}
                            </div>
                            <div className="text-sm text-gray-600">Standard</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {stats.vip}
                            </div>
                            <div className="text-sm text-gray-600">VIP</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-pink-600">
                                {stats.couple}
                            </div>
                            <div className="text-sm text-gray-600">Couple</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between">
                <Button onClick={handleReset} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2"/>
                    Reset
                </Button>
                <div className="space-x-2">
                    <Button onClick={onCancel} variant="outline">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={loading.submitting}
                    >
                        <Save className="w-4 h-4 mr-2"/>
                        {loading.submitting ? "Saving..." : "Save Layout"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SeatLayoutEditor;
