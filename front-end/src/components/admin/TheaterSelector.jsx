"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Theater, X, Plus } from "lucide-react"
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

        onTheatersChange(updatedTheaters)
    }

    const getSelectedTheaterNames = () => {
        return theaters.filter((theater) => selectedTheaters.includes(theater._id)).map((theater) => theater.name)
    }

    const removeTheater = (theaterId) => {
        const updatedTheaters = selectedTheaters.filter((id) => id !== theaterId)
        onTheatersChange(updatedTheaters)
    }

    if (showSelector) {
        return (
            <Card className="border-2 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Theater className="h-5 w-5" />
                        Select Theaters
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
                                placeholder="Search theaters..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Theater List */}
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-500">Loading theaters...</p>
                            </div>
                        ) : filteredTheaters.length > 0 ? (
                            filteredTheaters.map((theater) => (
                                <div key={theater._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                                    <Checkbox
                                        checked={selectedTheaters.includes(theater._id)}
                                        onCheckedChange={() => handleTheaterToggle(theater._id)}
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium">{theater.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {theater.type} • {theater.capacity} seats
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {theater.type}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                {searchQuery ? "No theaters found matching your search" : "No theaters available"}
                            </div>
                        )}
                    </div>

                    {/* Selected Count */}
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                            Selected: {selectedTheaters.length} theater{selectedTheaters.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Theaters</label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSelector(true)}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    {selectedTheaters.length > 0 ? "Manage Theaters" : "Add Theaters"}
                </Button>
            </div>

            {/* Selected Theaters Display */}
            {selectedTheaters.length > 0 ? (
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {theaters
                            .filter((theater) => selectedTheaters.includes(theater._id))
                            .map((theater) => (
                                <Badge key={theater._id} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                    <Theater className="h-3 w-3" />
                                    {theater.name}
                                    <button
                                        type="button"
                                        onClick={() => removeTheater(theater._id)}
                                        className="ml-1 text-red-400 hover:text-red-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                    </div>
                    <p className="text-xs text-gray-500">
                        {selectedTheaters.length} theater{selectedTheaters.length !== 1 ? "s" : ""} assigned to this branch
                    </p>
                </div>
            ) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <Theater className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No theaters assigned</p>
                    <p className="text-xs text-gray-400">Click "Add Theaters" to assign theaters to this branch</p>
                </div>
            )}
        </div>
    )
}

export default TheaterSelector
