"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, X, Loader2 } from "lucide-react"
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const MapSelector = ({ latitude = 10.8231, longitude = 106.6297, onLocationSelect, onClose }) => {
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markerRef = useRef(null)
    const [selectedLocation, setSelectedLocation] = useState({
        latitude,
        longitude,
    })
    const [loading, setLoading] = useState(false)
    const [mapLoading, setMapLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!mapRef.current) return

        try {
            mapInstanceRef.current = L.map(mapRef.current).setView([latitude, longitude], 15)

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstanceRef.current)

            markerRef.current = L.marker([latitude, longitude], {
                draggable: true
            }).addTo(mapInstanceRef.current)

            const handleLocationUpdate = (e) => {
                const { lat, lng } = e.latlng || e.target.getLatLng()
                markerRef.current.setLatLng([lat, lng])
                mapInstanceRef.current.panTo([lat, lng])
                setSelectedLocation({ latitude: lat, longitude: lng })
            }

            mapInstanceRef.current.on('click', handleLocationUpdate)
            markerRef.current.on('dragend', handleLocationUpdate)
            setMapLoading(false)

        } catch (err) {
            console.error("Map initialization error:", err)
            setError("Failed to initialize map")
            setMapLoading(false)
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
                markerRef.current = null
            }
        }
    }, [])

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser")
            return
        }

        setLoading(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude: lat, longitude: lng } = position.coords

                if (mapInstanceRef.current && markerRef.current) {
                    markerRef.current.setLatLng([lat, lng])
                    mapInstanceRef.current.panTo([lat, lng])
                    mapInstanceRef.current.setZoom(16)
                    setSelectedLocation({ latitude: lat, longitude: lng })
                }
                setLoading(false)
            },
            (error) => {
                console.error("Geolocation error:", error)
                setError("Unable to get your location")
                setLoading(false)
            }
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Select Branch Location</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {error && (
                <div className="p-2 bg-red-50 border-b border-red-200">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
            )}

            <div className="p-4 border-b">
                <Button
                    onClick={getCurrentLocation}
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Navigation className="h-4 w-4 mr-2" />
                    )}
                    Use Current Location
                </Button>
            </div>

            <div className="flex-1 relative">
                {mapLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                    </div>
                )}
                <div ref={mapRef} className="w-full h-full z-0" />
            </div>

            <div className="p-4 bg-gray-50 border-t">
                <div className="mb-4">
                    <p className="text-sm text-gray-600">Selected Coordinates:</p>
                    <p className="font-medium">
                        {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                    </p>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={() => onLocationSelect(selectedLocation)}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Confirm Location
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default MapSelector