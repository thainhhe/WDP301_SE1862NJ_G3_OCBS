"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Search, Navigation, X } from "lucide-react"

const MapSelector = ({ latitude = 10.8231, longitude = 106.6297, onLocationSelect, onClose }) => {
    const mapRef = useRef(null)
    const [map, setMap] = useState(null)
    const [marker, setMarker] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedLocation, setSelectedLocation] = useState({
        latitude,
        longitude,
        address: "",
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Initialize Google Maps
        const initMap = () => {
            if (!window.google) {
                console.error("Google Maps API not loaded")
                return
            }

            const mapInstance = new window.google.maps.Map(mapRef.current, {
                center: { lat: latitude, lng: longitude },
                zoom: 15,
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
            })

            const markerInstance = new window.google.maps.Marker({
                position: { lat: latitude, lng: longitude },
                map: mapInstance,
                draggable: true,
                title: "Branch Location",
            })

            // Handle map click
            mapInstance.addListener("click", (event) => {
                const lat = event.latLng.lat()
                const lng = event.latLng.lng()
                updateLocation(lat, lng, markerInstance, mapInstance)
            })

            // Handle marker drag
            markerInstance.addListener("dragend", (event) => {
                const lat = event.latLng.lat()
                const lng = event.latLng.lng()
                updateLocation(lat, lng, markerInstance, mapInstance)
            })

            setMap(mapInstance)
            setMarker(markerInstance)

            // Get initial address
            reverseGeocode(latitude, longitude)
        }

        // Load Google Maps API if not already loaded
        if (!window.google) {
            const script = document.createElement("script")
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBcne-Uj1lOewST8oRzcTRqkvX_tNSnKNs&libraries=places`
            script.async = true
            script.defer = true
            script.onload = initMap
            document.head.appendChild(script)
        } else {
            initMap()
        }
    }, [latitude, longitude])

    const updateLocation = (lat, lng, markerInstance, mapInstance) => {
        const newLocation = {
            latitude: lat,
            longitude: lng,
        }

        markerInstance.setPosition({ lat, lng })
        mapInstance.panTo({ lat, lng })
        setSelectedLocation(newLocation)
        reverseGeocode(lat, lng)
    }

    const reverseGeocode = async (lat, lng) => {
        if (!window.google) return

        const geocoder = new window.google.maps.Geocoder()
        try {
            const response = await geocoder.geocode({
                location: { lat, lng },
            })

            if (response.results[0]) {
                const address = response.results[0].formatted_address
                setSelectedLocation((prev) => ({
                    ...prev,
                    address,
                }))
            }
        } catch (error) {
            console.error("Reverse geocoding failed:", error)
        }
    }

    const searchLocation = async () => {
        if (!searchQuery.trim() || !window.google) return

        setLoading(true)
        const geocoder = new window.google.maps.Geocoder()

        try {
            const response = await geocoder.geocode({
                address: searchQuery,
            })

            if (response.results[0]) {
                const location = response.results[0].geometry.location
                const lat = location.lat()
                const lng = location.lng()

                updateLocation(lat, lng, marker, map)
                map.setZoom(16)
            }
        } catch (error) {
            console.error("Geocoding failed:", error)
        } finally {
            setLoading(false)
        }
    }

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by this browser.")
            return
        }

        setLoading(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude
                const lng = position.coords.longitude
                updateLocation(lat, lng, marker, map)
                map.setZoom(16)
                setLoading(false)
            },
            (error) => {
                console.error("Error getting current location:", error)
                setLoading(false)
            },
        )
    }

    const handleConfirm = () => {
        onLocationSelect(selectedLocation)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl h-[80vh] m-4">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Select Branch Location
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                    {/* Search Controls */}
                    <div className="flex gap-2 mb-4">
                        <div className="flex-1 flex gap-2">
                            <Input
                                placeholder="Search for an address..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && searchLocation()}
                            />
                            <Button onClick={searchLocation} disabled={loading} size="sm">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button onClick={getCurrentLocation} disabled={loading} variant="outline" size="sm">
                            <Navigation className="h-4 w-4 mr-2" />
                            Current Location
                        </Button>
                    </div>

                    {/* Map Container */}
                    <div ref={mapRef} className="flex-1 rounded-lg border" style={{ minHeight: "400px" }} />

                    {/* Location Info */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Latitude:</span> {selectedLocation.latitude?.toFixed(6)}
                            </div>
                            <div>
                                <span className="font-medium">Longitude:</span> {selectedLocation.longitude?.toFixed(6)}
                            </div>
                        </div>
                        {selectedLocation.address && (
                            <div className="mt-2 text-sm">
                                <span className="font-medium">Address:</span> {selectedLocation.address}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
                            Confirm Location
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default MapSelector
