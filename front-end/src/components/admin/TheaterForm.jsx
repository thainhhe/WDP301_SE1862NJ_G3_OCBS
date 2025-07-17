"use client"

import { useState, useEffect } from "react"
import { Building, Users, Settings, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const TheaterForm = ({ theater, seatLayouts = [], onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: "",
        capacity: "",
        seatLayout: "",
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (theater) {
            setFormData({
                name: theater.name || "",
                capacity: theater.capacity?.toString() || "",
                seatLayout: theater.seatLayout?._id || theater.seatLayout || "",
            })
        } else {
            setFormData({
                name: "",
                capacity: "",
                seatLayout: "",
            })
        }
        setErrors({})
    }, [theater])

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        // Theater name validation
        if (!formData.name.trim()) {
            newErrors.name = "Theater name is required"
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Theater name must be at least 2 characters"
        } else if (formData.name.trim().length > 100) {
            newErrors.name = "Theater name must be less than 100 characters"
        }

        // Capacity validation
        if (!formData.capacity) {
            newErrors.capacity = "Capacity is required"
        } else {
            const capacityNum = Number.parseInt(formData.capacity)
            if (isNaN(capacityNum) || capacityNum <= 0) {
                newErrors.capacity = "Capacity must be a positive number"
            } else if (capacityNum > 1000) {
                newErrors.capacity = "Capacity cannot exceed 1000 seats"
            } else if (capacityNum < 10) {
                newErrors.capacity = "Capacity must be at least 10 seats"
            }
        }

        // Seat layout validation
        if (!formData.seatLayout) {
            newErrors.seatLayout = "Seat layout selection is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)
        try {
            await onSubmit(formData)
        } catch (err) {
            console.error("Form submission error:", err)
        } finally {
            setLoading(false)
        }
    }

    const getSelectedSeatLayout = () => {
        const layout = seatLayouts.find((l) => l._id === formData.seatLayout)
        return layout ? `${layout.name} (${layout.rows}x${layout.seatsPerRow} seats)` : ""
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Theater Name */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Theater Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Enter theater name (e.g., Theater 1, IMAX Hall)"
                        className={`pl-10 ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
                        maxLength={100}
                    />
                </div>
                {errors.name && (
                    <div className="flex items-center text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                    </div>
                )}
                <p className="text-xs text-gray-500">Choose a descriptive name that helps identify this theater</p>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Seating Capacity <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => handleChange("capacity", e.target.value)}
                        placeholder="Enter total number of seats"
                        className={`pl-10 ${errors.capacity ? "border-red-500 focus:border-red-500" : ""}`}
                        min="10"
                        max="1000"
                    />
                </div>
                {errors.capacity && (
                    <div className="flex items-center text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.capacity}
                    </div>
                )}
                <p className="text-xs text-gray-500">Total number of seats available in this theater (10-1000)</p>
            </div>

            {/* Seat Layout Selection */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Seat Layout <span className="text-red-500">*</span>
                </label>
                <Select value={formData.seatLayout} onValueChange={(value) => handleChange("seatLayout", value)}>
                    <SelectTrigger className={errors.seatLayout ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a seat layout" />
                    </SelectTrigger>
                    <SelectContent>
                        {seatLayouts.length === 0 ? (
                            <div className="p-2 text-sm text-gray-500">No seat layouts available</div>
                        ) : (
                            seatLayouts.map((layout) => (
                                <SelectItem key={layout._id} value={layout._id}>
                                    <div className="flex items-center">
                                        <Settings className="w-4 h-4 mr-2 text-gray-400" />
                                        <div>
                                            <div className="font-medium">{layout.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {layout.rows} rows × {layout.seatsPerRow} seats per row
                                            </div>
                                        </div>
                                    </div>
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
                {errors.seatLayout && (
                    <div className="flex items-center text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.seatLayout}
                    </div>
                )}
                {formData.seatLayout && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Selected:</strong> {getSelectedSeatLayout()}
                    </div>
                )}
            </div>

            {/* Information Card */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Important Notes:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Theater capacity should match the selected seat layout capacity</li>
                                <li>Seat layout defines the seating arrangement and pricing tiers</li>
                                <li>Make sure to select an appropriate seat layout for this theater</li>
                                <li>Theater names should be unique for easy identification</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]">
                    {loading ? (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                        </div>
                    ) : (
                        <>{theater ? "Update Theater" : "Create Theater"}</>
                    )}
                </Button>
            </div>
        </form>
    )
}

export default TheaterForm
