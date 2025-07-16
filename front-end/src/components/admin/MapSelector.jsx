"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Search, Navigation, X, Loader2 } from "lucide-react"

const MapSelector = ({ latitude = 10.8231, longitude = 106.6297, onLocationSelect, onClose }) => {
    const mapRef = useRef(null)
    const [map, setMap] = useState(null)
    const [marker, setMarker] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedLocation, setSelectedLocation] = useState({
        latitude,
        longitude,
        address: "",
        city: "",
        province: "",
        country: "",
    })
    const [loading, setLoading] = useState(false)
    const [mapLoading, setMapLoading] = useState(true)

    useEffect(() => {
        // Initialize Google Maps
        const initMap = () => {
            if (!window.google) {
                console.error("Google Maps API not loaded")
                setMapLoading(false)
                return
            }

            try {
                const mapInstance = new window.google.maps.Map(mapRef.current, {
                    center: { lat: latitude, lng: longitude },
                    zoom: 15,
                    mapTypeControl: true,
                    streetViewControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                    mapTypeControlOptions: {
                        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                        position: window.google.maps.ControlPosition.TOP_CENTER,
                    },
                    zoomControlOptions: {
                        position: window.google.maps.ControlPosition.RIGHT_CENTER,
                    },
                })

                const markerInstance = new window.google.maps.Marker({
                    position: { lat: latitude, lng: longitude },
                    map: mapInstance,
                    draggable: true,
                    title: "Branch Location",
                    animation: window.google.maps.Animation.DROP,
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
                setMapLoading(false)

                // Get initial address
                reverseGeocode(latitude, longitude)
            } catch (error) {
                console.error("Error initializing map:", error)
                setMapLoading(false)
            }
        }

        // Load Google Maps API if not already loaded
        if (!window.google) {
            const script = document.createElement("script")
            script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`
            script.async = true
            script.defer = true
            script.onload = initMap
            script.onerror = () => {
                console.error("Failed to load Google Maps API")
                setMapLoading(false)
            }
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
        setSelectedLocation((prev) => ({ ...prev, ...newLocation }))
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
                const result = response.results[0]
                const addressComponents = result.address_components

                // Extract address components
                const address = result.formatted_address
                let city = ""
                let province = ""
                let country = ""

                addressComponents.forEach((component) => {
                    const types = component.types
                    if (types.includes("locality") || types.includes("administrative_area_level_2")) {
                        city = component.long_name
                    } else if (types.includes("administrative_area_level_1")) {
                        province = component.long_name
                    } else if (types.includes("country")) {
                        country = component.long_name
                    }
                })

                setSelectedLocation((prev) => ({
                    ...prev,
                    address,
                    city,
                    province,
                    country,
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
            } else {
                alert("Location not found. Please try a different search term.")
            }
        } catch (error) {
            console.error("Geocoding failed:", error)
            alert("Search failed. Please try again.")
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
                alert("Unable to get your current location. Please ensure location services are enabled.")
                setLoading(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            },
        )
    }

    const handleConfirm = () => {
        onLocationSelect(selectedLocation)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <MapPin className="h-6 w-6 text-red-600" />
                        Select Branch Location
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-4">
                    {/* Search Controls */}
                    <div className="flex gap-3">
                        <div className="flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search for an address (e.g., 'Ho Chi Minh City', 'District 1')"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && !loading && searchLocation()}
                                    className="pl-10"
                                />
                            </div>
                            <Button onClick={searchLocation} disabled={loading} size="default">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                Search
                            </Button>
                        </div>
                        <Button onClick={getCurrentLocation} disabled={loading} variant="outline" size="default">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                            Current Location
                        </Button>
                    </div>

                    {/* Map Container */}
                    <div className="flex-1 relative rounded-lg border overflow-hidden" style={{ minHeight: "500px" }}>
                        {mapLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                                <div className="text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-red-600" />
                                    <p className="text-gray-600">Loading map...</p>
                                </div>
                            </div>
                        )}
                        <div ref={mapRef} className="w-full h-full" />
                    </div>

                    {/* Location Information */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <h3 className="font-medium text-gray-900">Selected Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">Coordinates:</span>
                                <p className="text-gray-600">
                                    {selectedLocation.latitude?.toFixed(6)}, {selectedLocation.longitude?.toFixed(6)}
                                </p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">City:</span>
                                <p className="text-gray-600">{selectedLocation.city || "Not available"}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Province:</span>
                                <p className="text-gray-600">{selectedLocation.province || "Not available"}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Country:</span>
                                <p className="text-gray-600">{selectedLocation.country || "Not available"}</p>
                            </div>
                        </div>
                        {selectedLocation.address && (
                            <div className="text-sm">
                                <span className="font-medium text-gray-700">Full Address:</span>
                                <p className="text-gray-600 mt-1">{selectedLocation.address}</p>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            <strong>Instructions:</strong> Click anywhere on the map or drag the red marker to select a location. You
                            can also search for a specific address or use your current location.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-2 border-t">
                        <Button variant="outline" onClick={onClose} size="lg">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700" size="lg">
                            Confirm Location
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default MapSelector
