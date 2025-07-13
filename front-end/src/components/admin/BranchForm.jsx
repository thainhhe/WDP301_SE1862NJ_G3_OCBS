"use client"

import { useState, useEffect } from "react"
import { Building, MapPin, AlertCircle, X, Clock, Phone, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

const BranchForm = ({ branch, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: "",
        location: { address: "", city: "" },
        contact: { phone: "", email: "" },
        operatingHours: { open: "09:00", close: "23:00" },
        facilities: [],
        image: "",
        isActive: true,
    })
    const [newFacility, setNewFacility] = useState("")
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

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
            })
        } else {
            setFormData({
                name: "",
                location: { address: "", city: "" },
                contact: { phone: "", email: "" },
                operatingHours: { open: "09:00", close: "23:00" },
                facilities: [],
                image: "",
                isActive: true,
            })
        }
        setErrors({})
    }, [branch])

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name.includes(".")) {
            const [parent, child] = name.split(".")
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }))
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }))
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }))
        }
    }

    const handleCheckboxChange = (checked) => {
        setFormData((prev) => ({ ...prev, isActive: checked }))
    }

    const handleAddFacility = () => {
        if (newFacility.trim() && !formData.facilities.includes(newFacility.trim())) {
            setFormData((prev) => ({
                ...prev,
                facilities: [...prev.facilities, newFacility.trim()],
            }))
            setNewFacility("")
        }
    }

    const handleRemoveFacility = (facilityToRemove) => {
        setFormData((prev) => ({
            ...prev,
            facilities: prev.facilities.filter((f) => f !== facilityToRemove),
        }))
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = "Branch name is required"
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Branch name must be at least 2 characters"
        }

        if (!formData.location.city.trim()) {
            newErrors["location.city"] = "City is required"
        }

        if (!formData.location.address.trim()) {
            newErrors["location.address"] = "Address is required"
        }

        if (!formData.contact.phone.trim()) {
            newErrors["contact.phone"] = "Phone is required"
        }

        if (!formData.contact.email.trim()) {
            newErrors["contact.email"] = "Email is required"
        } else if (!/^\S+@\S+\.\S+$/.test(formData.contact.email)) {
            newErrors["contact.email"] = "Invalid email format"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setLoading(true)
        try {
            await onSubmit(formData)
        } catch (err) {
            console.error("Form submission error:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Branch Name */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Branch Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter branch name"
                        className={`pl-10 ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
                    />
                </div>
                {errors.name && (
                    <div className="flex items-center text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                    </div>
                )}
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            name="location.city"
                            value={formData.location.city}
                            onChange={handleChange}
                            placeholder="Enter city"
                            className={`pl-10 ${errors["location.city"] ? "border-red-500 focus:border-red-500" : ""}`}
                        />
                    </div>
                    {errors["location.city"] && (
                        <div className="flex items-center text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors["location.city"]}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        name="location.address"
                        value={formData.location.address}
                        onChange={handleChange}
                        placeholder="Enter address"
                        className={errors["location.address"] ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {errors["location.address"] && (
                        <div className="flex items-center text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors["location.address"]}
                        </div>
                    )}
                </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            name="contact.phone"
                            value={formData.contact.phone}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                            className={`pl-10 ${errors["contact.phone"] ? "border-red-500 focus:border-red-500" : ""}`}
                        />
                    </div>
                    {errors["contact.phone"] && (
                        <div className="flex items-center text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors["contact.phone"]}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="email"
                            name="contact.email"
                            value={formData.contact.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            className={`pl-10 ${errors["contact.email"] ? "border-red-500 focus:border-red-500" : ""}`}
                        />
                    </div>
                    {errors["contact.email"] && (
                        <div className="flex items-center text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors["contact.email"]}
                        </div>
                    )}
                </div>
            </div>

            {/* Operating Hours */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Opening Time</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="time"
                            name="operatingHours.open"
                            value={formData.operatingHours.open}
                            onChange={handleChange}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Closing Time</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="time"
                            name="operatingHours.close"
                            value={formData.operatingHours.close}
                            onChange={handleChange}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Facilities */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Facilities</label>
                <div className="flex space-x-2">
                    <Input
                        type="text"
                        value={newFacility}
                        onChange={(e) => setNewFacility(e.target.value)}
                        placeholder="Add facility..."
                        className="flex-grow"
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddFacility()
                            }
                        }}
                    />
                    <Button type="button" onClick={handleAddFacility} variant="outline" size="sm">
                        Add
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {formData.facilities.map((facility, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {facility}
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

            {/* Image URL */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <Input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="e.g., /uploads/branches/branch-image.jpg"
                />
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
                <Checkbox id="isActive" checked={formData.isActive} onCheckedChange={handleCheckboxChange} />
                <label
                    htmlFor="isActive"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Active
                </label>
            </div>

            {/* Information Card */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Important Notes:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Branch information will be displayed to customers</li>
                                <li>Operating hours should reflect actual business hours</li>
                                <li>Facilities help customers choose the right location</li>
                                <li>Inactive branches won't appear in customer searches</li>
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
                        <>{branch ? "Update Branch" : "Create Branch"}</>
                    )}
                </Button>
            </div>
        </form>
    )
}

export default BranchForm
