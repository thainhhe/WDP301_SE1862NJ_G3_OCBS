"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Theater, X, Plus, Loader2 } from "lucide-react"
import { theaterService } from "../../services/theaterService"

const TheaterSelector = ({ selectedTheaters = [], onTheatersChange, branchId }) => {
    const [theaters, setTheaters] = useState([])
    const [filteredTheaters, setFilteredTheaters] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [showSelector, setShowSelector] = useState(false)

    useEffect(() => {
        fetchTheaters()
    }, [])

    useEffect(() => {
        // Filter theaters based on search query
        const filtered = theaters.filter(
            (theater) =>
                theater.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                theater.type?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        setFilteredTheaters(filtered)
    }, [theaters, searchQuery])

    const fetchTheaters = async () => {
        setLoading(true)
        try {
            const data = await theaterService.getTheaters()
            console.log("Fetched theaters:", data)
            setTheaters(data)
            setFilteredTheaters(data)
        } catch (error) {
            console.error("Failed to fetch theaters:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleTheaterToggle = (theaterId) => {
        const updatedTheaters = selectedTheaters.includes(theaterId)
            ? selectedTheaters.filter((id) => id !== theaterId)
            : [...selectedTheaters, theaterId]

        console.log("Updated theaters:", updatedTheaters)
        onTheatersChange(updatedTheaters)
    }

    const removeTheater = (theaterId) => {
        const updatedTheaters = selectedTheaters.filter((id) => id !== theaterId)
        console.log("Removed theater, updated list:", updatedTheaters)
        onTheatersChange(updatedTheaters)
    }

    const getSelectedTheaterDetails = () => {
        return theaters.filter((theater) => selectedTheaters.includes(theater._id))
    }

    if (showSelector) {
        return (
            <Card className="border-2 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Theater className="h-5 w-5" />
                        Select Theaters ({selectedTheaters.length} selected)
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowSelector(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search theaters by name or type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Theater List */}
                    <div className="max-h-80 overflow-y-auto space-y-2">
                        {loading ? (
                            <div className="text-center py-8">
                                <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2 text-red-600" />
                                <p className="text-sm text-gray-500">Loading theaters...</p>
                            </div>
                        ) : filteredTheaters.length > 0 ? (
                            filteredTheaters.map((theater) => (
                                <div
                                    key={theater._id}
                                    className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                                        selectedTheaters.includes(theater._id) ? "bg-blue-50 border-blue-200" : ""
                                    }`}
                                >
                                    <Checkbox
                                        checked={selectedTheaters.includes(theater._id)}
                                        onCheckedChange={() => handleTheaterToggle(theater._id)}
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{theater.name}</div>
                                        <div className="text-sm text-gray-500">
                                            Type: {theater.type || "Standard"}
                                        </div>
                                        {theater.description && <div className="text-xs text-gray-400 mt-1">{theater.description}</div>}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge variant="outline" className="text-xs">
                                            {theater.type || "Standard"}
                                        </Badge>
                                        {theater.isActive !== undefined && (
                                            <Badge variant={theater.isActive ? "default" : "secondary"} className="text-xs">
                                                {theater.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Theater className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                                <p>{searchQuery ? "No theaters found matching your search" : "No theaters available"}</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {searchQuery ? "Try adjusting your search terms" : "Create theaters first to assign them to branches"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Selected Count */}
                    <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-700">
                                Selected: {selectedTheaters.length} theater{selectedTheaters.length !== 1 ? "s" : ""}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSelector(false)}
                                className="bg-white hover:bg-gray-50"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Assigned Theaters</label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSelector(true)}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    {selectedTheaters.length > 0 ? `Manage (${selectedTheaters.length})` : "Add Theaters"}
                </Button>
            </div>

            {/* Selected Theaters Display */}
            {selectedTheaters.length > 0 ? (
                <div className="space-y-3">
                    <div className="grid gap-2">
                        {getSelectedTheaterDetails().map((theater) => (
                            <div key={theater._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <Theater className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <div className="font-medium text-gray-900">{theater.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {theater.type || "Standard"}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                        {theater.type || "Standard"}
                                    </Badge>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeTheater(theater._id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                        💡 {selectedTheaters.length} theater{selectedTheaters.length !== 1 ? "s" : ""} will be assigned to this
                        branch
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <Theater className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-600">No theaters assigned</p>
                    <p className="text-xs text-gray-500 mt-1">Click "Add Theaters" to assign theaters to this branch</p>
                </div>
            )}
        </div>
    )
}

export default TheaterSelector
