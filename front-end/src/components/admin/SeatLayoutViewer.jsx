"use client"

import { useState, useEffect } from "react"
import { Monitor, Users, Crown, Heart, X, Info, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card.tsx"
import { Badge } from "@components/ui/badge.tsx"

const SeatLayoutViewer = ({ layout }) => {
    const [seats, setSeats] = useState([])

    useEffect(() => {
        if (layout) {
            generateSeats()
        }
    }, [layout])

    const generateSeats = () => {
        if (!layout) return

        const generatedSeats = []

        for (let rowIndex = 0; rowIndex < layout.rows; rowIndex++) {
            const rowLabel = layout.rowLabels?.[rowIndex] || String.fromCharCode(65 + rowIndex)

            for (let seatNum = 1; seatNum <= layout.seatsPerRow; seatNum++) {
                const seat = {
                    id: `${rowLabel}${seatNum}`,
                    row: rowLabel,
                    number: seatNum,
                    type: getSeatType(rowLabel, seatNum),
                    disabled: isSeatDisabled(rowLabel, seatNum),
                }

                generatedSeats.push(seat)
            }
        }

        setSeats(generatedSeats)
    }

    const getSeatType = (row, number) => {
        if (!layout) return "standard"

        // Check if it's a VIP row
        if (layout.vipRows?.includes(row)) {
            return "vip"
        }

        // Check if it's a couple seat
        const coupleRange = layout.coupleSeats?.find(
            (range) => range.row === row && number >= range.startSeat && number <= range.endSeat,
        )
        if (coupleRange) {
            return "couple"
        }

        return "standard"
    }

    const isSeatDisabled = (row, number) => {
        if (!layout?.disabledSeats) return false

        return layout.disabledSeats.some((seat) => seat.row === row && seat.number === number)
    }

    const getSeatIcon = (seat) => {
        if (seat.disabled) {
            return <X className="w-3 h-3" />
        }

        switch (seat.type) {
            case "vip":
                return <Crown className="w-3 h-3" />
            case "couple":
                return <Heart className="w-3 h-3" />
            default:
                return <Users className="w-3 h-3" />
        }
    }

    const getSeatColor = (seat) => {
        if (seat.disabled) {
            return "bg-gray-300 text-gray-600 border-gray-400 cursor-not-allowed"
        }

        switch (seat.type) {
            case "vip":
                return "bg-yellow-200 text-yellow-800 border-yellow-400 hover:bg-yellow-300"
            case "couple":
                return "bg-pink-200 text-pink-800 border-pink-400 hover:bg-pink-300"
            default:
                return "bg-green-200 text-green-800 border-green-400 hover:bg-green-300"
        }
    }

    const groupSeatsByRow = () => {
        const grouped = {}
        seats.forEach((seat) => {
            if (!grouped[seat.row]) {
                grouped[seat.row] = []
            }
            grouped[seat.row].push(seat)
        })
        return grouped
    }

    const calculateStats = () => {
        if (!layout) return { total: 0, standard: 0, vip: 0, couple: 0, disabled: 0 }

        const totalSeats = layout.rows * layout.seatsPerRow
        const disabledSeats = layout.disabledSeats?.length || 0
        const vipSeats = (layout.vipRows?.length || 0) * layout.seatsPerRow
        const coupleSeats = (layout.coupleSeats || []).reduce((total, range) => {
            return total + (range.endSeat - range.startSeat + 1)
        }, 0)
        const standardSeats = totalSeats - vipSeats - coupleSeats - disabledSeats

        return {
            total: totalSeats - disabledSeats,
            standard: Math.max(0, standardSeats),
            vip: vipSeats,
            couple: coupleSeats,
            disabled: disabledSeats,
        }
    }

    if (!layout) {
        return (
            <div className="text-center py-12">
                <Info className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Seat Layout</h3>
                <p className="text-gray-500">No seat layout has been configured for this theater.</p>
            </div>
        )
    }

    const groupedSeats = groupSeatsByRow()
    const rowLabels = Object.keys(groupedSeats).sort()
    const stats = calculateStats()

    return (
        <div className="space-y-6">
            {/* Layout Header */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                        <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                        {layout.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="bg-white">
                            {layout.rows} Rows
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                            {layout.seatsPerRow} Seats per Row
                        </Badge>
                        <Badge
                            variant={layout.isActive ? "default" : "secondary"}
                            className={layout.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                            {layout.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            {/* Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Seating Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                            <div className="text-sm text-blue-800 font-medium">Total Available</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{stats.standard}</div>
                            <div className="text-sm text-green-800 font-medium">Standard</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{stats.vip}</div>
                            <div className="text-sm text-yellow-800 font-medium">VIP</div>
                        </div>
                        <div className="bg-pink-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-pink-600">{stats.couple}</div>
                            <div className="text-sm text-pink-800 font-medium">Couple</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-gray-600">{stats.disabled}</div>
                            <div className="text-sm text-gray-800 font-medium">Disabled</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Seat Types Legend</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-6 justify-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-200 border-2 border-green-400 rounded flex items-center justify-center">
                                <Users className="w-4 h-4 text-green-800" />
                            </div>
                            <div>
                                <div className="font-medium text-green-800">Standard Seat</div>
                                <div className="text-sm text-gray-600">Regular seating</div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-200 border-2 border-yellow-400 rounded flex items-center justify-center">
                                <Crown className="w-4 h-4 text-yellow-800" />
                            </div>
                            <div>
                                <div className="font-medium text-yellow-800">VIP Seat</div>
                                <div className="text-sm text-gray-600">Premium seating</div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-pink-200 border-2 border-pink-400 rounded flex items-center justify-center">
                                <Heart className="w-4 h-4 text-pink-800" />
                            </div>
                            <div>
                                <div className="font-medium text-pink-800">Couple Seat</div>
                                <div className="text-sm text-gray-600">Double seating</div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-300 border-2 border-gray-400 rounded flex items-center justify-center">
                                <X className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-800">Disabled</div>
                                <div className="text-sm text-gray-600">Not available</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Seat Map */}
            <Card>
                <CardHeader>
                    <div className="text-center">
                        <CardTitle className="text-lg flex items-center justify-center mb-4">
                            <Monitor className="w-6 h-6 mr-2 text-gray-600" />
                            SCREEN
                        </CardTitle>
                        <div className="w-full h-3 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300 rounded-full shadow-inner"></div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {rowLabels.map((row) => (
                            <div key={row} className="flex items-center justify-center space-x-2">
                                {/* Row Label (Left) */}
                                <div className="w-10 text-center font-bold text-gray-700 text-lg">{row}</div>

                                {/* Seats */}
                                <div className="flex space-x-1">
                                    {groupedSeats[row].map((seat, index) => {
                                        const showAisle = layout.aisleAfterColumns?.includes(seat.number)

                                        return (
                                            <div key={seat.id} className="flex items-center">
                                                <div
                                                    className={`
                            w-8 h-8 rounded border-2 flex items-center justify-center
                            text-xs font-medium transition-all duration-200
                            ${getSeatColor(seat)}
                          `}
                                                    title={`Seat ${seat.row}${seat.number} - ${seat.type.toUpperCase()}${seat.disabled ? " (DISABLED)" : ""}`}
                                                >
                                                    {getSeatIcon(seat)}
                                                </div>
                                                {showAisle && <div className="w-6 border-l-2 border-dashed border-gray-300 h-8"></div>}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Row Label (Right) */}
                                <div className="w-10 text-center font-bold text-gray-700 text-lg">{row}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Additional Information */}
            {layout.aisleAfterColumns?.length > 0 && (
                <Card className="bg-gray-50">
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-700">
                            <strong>Aisle Configuration:</strong> Aisles are placed after columns{" "}
                            {layout.aisleAfterColumns.join(", ")}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default SeatLayoutViewer
