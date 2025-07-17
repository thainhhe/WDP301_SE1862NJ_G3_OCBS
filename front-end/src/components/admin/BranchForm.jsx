"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Map, Building, MapPin, Phone, Clock, Theater, Loader2 } from "lucide-react"
import MapSelector from "./MapSelector"
import TheaterSelector from "./TheaterSelector"

const BranchForm = ({ branch, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: "",
        location: {
            address: "",
            city: "",
            province: "",
            coordinates: {
                latitude: 10.8231,
                longitude: 106.6297,
            },
        },
        contact: {
            phone: "",
            email: "",
        },
        operatingHours: {
            open: "09:00",
            close: "23:00",
        },
        facilities: [],
        theaters: [],
        image: "",
        isActive: true,
    })

    const [newFacility, setNewFacility] = useState("")
    const [showMap, setShowMap] = useState(false)
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (branch) {
            console.log("Editing branch:", branch)
            setFormData({
                name: branch.name || "",
                location: {
                    address: branch.location?.address || "",
                    city: branch.location?.city || "",
                    province: branch.location?.province || "",
                    coordinates: {
                        latitude: branch.location?.coordinates?.latitude || 10.8231,
                        longitude: branch.location?.coordinates?.longitude || 106.6297,
                    },
                },
                contact: {
                    phone: branch.contact?.phone || "",
                    email: branch.contact?.email || "",
                },
                operatingHours: {
                    open: branch.operatingHours?.open || "09:00",
                    close: branch.operatingHours?.close || "23:00",
                },
                facilities: branch.facilities || [],
                theaters: branch.theaters || [],
                image: branch.image || "",
                isActive: branch.isActive !== undefined ? branch.isActive : true,
            })
        }
    }, [branch])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        const keys = name.split(".")

        if (keys.length === 1) {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }))
        } else if (keys.length === 2) {
            setFormData((prev) => ({
                ...prev,
                [keys[0]]: {
                    ...prev[keys[0]],
                    [keys[1]]: value,
                },
            }))
        } else if (keys.length === 3) {
            setFormData((prev) => ({
                ...prev,
                [keys[0]]: {
                    ...prev[keys[0]],
                    [keys[1]]: {
                        ...prev[keys[0]][keys[1]],
                        [keys[2]]: Number.parseFloat(value) || value,
                    },
                },
            }))
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }))
        }
    }

    const addFacility = () => {
        if (newFacility.trim() && !formData.facilities.includes(newFacility.trim())) {
            setFormData((prev) => ({
                ...prev,
                facilities: [...prev.facilities, newFacility.trim()],
            }))
            setNewFacility("")
        }
    }

    const removeFacility = (facilityToRemove) => {
        setFormData((prev) => ({
            ...prev,
            facilities: prev.facilities.filter((facility) => facility !== facilityToRemove),
        }))
    }

    const handleLocationSelect = (locationData) => {
        console.log("Location selected:", locationData)

        // Auto-fill location fields from map selection
        setFormData((prev) => ({
            ...prev,
            location: {
                ...prev.location,
                coordinates: {
                    latitude: locationData.latitude,
                    longitude: locationData.longitude,
                },
                // Auto-fill address, city, and province if available
                address: locationData.address || prev.location.address,
                city: locationData.city || prev.location.city,
                province: locationData.province || prev.location.province,
            },
        }))

        // Clear related errors
        setErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors.address
            delete newErrors.city
            delete newErrors.province
            delete newErrors.latitude
            delete newErrors.longitude
            return newErrors
        })
    }

    const handleTheatersChange = (theaters) => {
        console.log("Theaters changed:", theaters)
        setFormData((prev) => ({
            ...prev,
            theaters,
        }))
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) newErrors.name = "Branch name is required"
        if (!formData.location.address.trim()) newErrors.address = "Address is required"
        if (!formData.location.city.trim()) newErrors.city = "City is required"
        if (!formData.location.province.trim()) newErrors.province = "Province is required"
        if (!formData.contact.phone.trim()) newErrors.phone = "Phone is required"
        if (!formData.contact.email.trim()) newErrors.email = "Email is required"
        else if (!/^\S+@\S+\.\S+$/.test(formData.contact.email)) newErrors.email = "Invalid email format"

        // Validate coordinates
        const lat = formData.location.coordinates.latitude
        const lng = formData.location.coordinates.longitude
        if (lat < -90 || lat > 90) newErrors.latitude = "Latitude must be between -90 and 90"
        if (lng < -180 || lng > 180) newErrors.longitude = "Longitude must be between -180 and 180"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setLoading(true)
        try {
            console.log("Submitting form data:", formData)
            await onSubmit(formData)
        } catch (error) {
            console.error("Form submission error:", error)
        } finally {
            setLoading(false)
        }
    }

    if (showMap) {
        return (
            <MapSelector
                latitude={formData.location.coordinates.latitude}
                longitude={formData.location.coordinates.longitude}
                onLocationSelect={handleLocationSelect}
                onClose={() => setShowMap(false)}
            />
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Basic Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Branch Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter branch name (e.g., CGV Aeon Mall Bình Tân)"
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Image URL</label>
                        <Input
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="Enter image URL (optional)"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="rounded"
                        />
                        <label className="text-sm font-medium">Active Branch</label>
                        <span className="text-xs text-gray-500">(Inactive branches won't appear in customer searches)</span>
                    </div>
                </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Location Information
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowMap(true)}
                            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
                        >
                            <Map className="h-4 w-4" />
                            Select on Map
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Address <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="location.address"
                            value={formData.location.address}
                            onChange={handleChange}
                            placeholder="Enter full address (will be auto-filled when selecting on map)"
                            className={errors.address ? "border-red-500" : ""}
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                City <span className="text-red-500">*</span>
                            </label>
                            <Input
                                name="location.city"
                                value={formData.location.city}
                                onChange={handleChange}
                                placeholder="Enter city (auto-filled from map)"
                                className={errors.city ? "border-red-500" : ""}
                            />
                            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Province <span className="text-red-500">*</span>
                            </label>
                            <Input
                                name="location.province"
                                value={formData.location.province}
                                onChange={handleChange}
                                placeholder="Enter province (auto-filled from map)"
                                className={errors.province ? "border-red-500" : ""}
                            />
                            {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Latitude <span className="text-red-500">*</span>
                            </label>
                            <Input
                                name="location.coordinates.latitude"
                                type="number"
                                step="any"
                                value={formData.location.coordinates.latitude}
                                onChange={handleChange}
                                placeholder="Auto-filled from map"
                                className={errors.latitude ? "border-red-500" : ""}
                            />
                            {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Longitude <span className="text-red-500">*</span>
                            </label>
                            <Input
                                name="location.coordinates.longitude"
                                type="number"
                                step="any"
                                value={formData.location.coordinates.longitude}
                                onChange={handleChange}
                                placeholder="Auto-filled from map"
                                className={errors.longitude ? "border-red-500" : ""}
                            />
                            {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>}
                        </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                            💡 <strong>Tip:</strong> Click "Select on Map" to automatically fill address, city, province, and
                            coordinates by selecting a location on the map.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Contact Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <Input
                                name="contact.phone"
                                value={formData.contact.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number (e.g., 02812345678)"
                                className={errors.phone ? "border-red-500" : ""}
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <Input
                                name="contact.email"
                                type="email"
                                value={formData.contact.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                                className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Operating Hours
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Opening Time</label>
                            <Input
                                name="operatingHours.open"
                                type="time"
                                value={formData.operatingHours.open}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Closing Time</label>
                            <Input
                                name="operatingHours.close"
                                type="time"
                                value={formData.operatingHours.close}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Theater Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Theater className="h-5 w-5" />
                        Theater Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <TheaterSelector
                        selectedTheaters={formData.theaters}
                        onTheatersChange={handleTheatersChange}
                        branchId={branch?._id}
                    />
                </CardContent>
            </Card>

            {/* Facilities */}
            <Card>
                <CardHeader>
                    <CardTitle>Facilities & Amenities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            value={newFacility}
                            onChange={(e) => setNewFacility(e.target.value)}
                            placeholder="Add facility (e.g., Parking, Food court, IMAX)"
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFacility())}
                        />
                        <Button type="button" onClick={addFacility} size="sm">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {formData.facilities.map((facility, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                {facility}
                                <button type="button" onClick={() => removeFacility(facility)} className="ml-1 hover:text-red-500">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>

                    {formData.facilities.length === 0 && (
                        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                            <p className="text-sm">No facilities added yet</p>
                            <p className="text-xs">Add facilities like parking, food court, accessibility features, etc.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading} size="lg">
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700" size="lg">
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving Branch...
                        </div>
                    ) : (
                        <>{branch ? "Update Branch" : "Create Branch"}</>
                    )}
                </Button>
            </div>
        </form>
    )
}

export default BranchForm
