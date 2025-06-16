"use client"

import { useState, useEffect } from "react"
import {
    Calendar,
    Clock,
    MapPin,
    Film,
    Users,
    AlertCircle,
    Plus,
    Search,
    Filter,
    Trash2,
    Edit,
    DollarSign,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Updated service to match your database structure
const showtimeService = {
    async getShowtimes(params = {}) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data matching your database structure
        const mockShowtimes = [
            {
                _id: "6839f8cf1d41275d7f3ed919",
                movie: {
                    _id: "6837e2a9dbcf9e3ee9724aab",
                    title: "Siêu Anh Hùng Báo Thù Trở Lại",
                    duration: 148,
                },
                branch: {
                    location: {
                        coordinates: {
                            latitude: 10.7769,
                            longitude: 106.7009,
                        },
                        address: "123 Đường Đồng Khởi, P. Thanh Xuân",
                        city: "Hà Nội",
                        province: "Hà Nội",
                    },
                    _id: "6837e76a9b8c8c3c76374787",
                    name: "CinemaHub Thanh Xuân",
                },
                theater: {
                    _id: "6837e76a9b8c8c3c76374788",
                    name: "Phòng chiếu 1 (64 ghế)",
                    capacity: 64,
                },
                price: {
                    standard: 100000,
                    vip: 150000,
                    couple: 220000,
                },
                startTime: "2025-05-24T14:00:00.000Z",
                endTime: "2025-05-24T16:28:00.000Z",
                isLastShow: false,
                isFirstShow: true,
                seatsAvailable: 118,
                seatsBooked: 2,
                createdAt: "2025-05-01T10:00:00.000Z",
                updatedAt: "2025-05-01T10:00:00.000Z",
            },
            {
                _id: "6839f8cf1d41275d7f3ed920",
                movie: {
                    _id: "6837e2a9dbcf9e3ee9724aac",
                    title: "Người Nhện: Không Còn Nhà",
                    duration: 135,
                },
                branch: {
                    location: {
                        coordinates: {
                            latitude: 10.7769,
                            longitude: 106.7009,
                        },
                        address: "456 Đường Lê Lợi, Q.1",
                        city: "Hồ Chí Minh",
                        province: "Hồ Chí Minh",
                    },
                    _id: "6837e76a9b8c8c3c76374788",
                    name: "CinemaHub Quận 1",
                },
                theater: {
                    _id: "6837e76a9b8c8c3c76374789",
                    name: "Phòng chiếu VIP (32 ghế)",
                    capacity: 32,
                },
                price: {
                    standard: 120000,
                    vip: 180000,
                    couple: 250000,
                },
                startTime: "2025-05-24T19:30:00.000Z",
                endTime: "2025-05-24T21:45:00.000Z",
                isLastShow: true,
                isFirstShow: false,
                seatsAvailable: 28,
                seatsBooked: 4,
                createdAt: "2025-05-01T10:00:00.000Z",
                updatedAt: "2025-05-01T10:00:00.000Z",
            },
            {
                _id: "6839f8cf1d41275d7f3ed921",
                movie: {
                    _id: "6837e2a9dbcf9e3ee9724aad",
                    title: "Avatar: Dòng Chảy Của Nước",
                    duration: 192,
                },
                branch: {
                    location: {
                        coordinates: {
                            latitude: 10.7769,
                            longitude: 106.7009,
                        },
                        address: "789 Đường Nguyễn Huệ, Q.1",
                        city: "Hồ Chí Minh",
                        province: "Hồ Chí Minh",
                    },
                    _id: "6837e76a9b8c8c3c76374789",
                    name: "CinemaHub IMAX",
                },
                theater: {
                    _id: "6837e76a9b8c8c3c76374790",
                    name: "IMAX Theater (120 ghế)",
                    capacity: 120,
                },
                price: {
                    standard: 200000,
                    vip: 280000,
                    couple: 350000,
                },
                startTime: "2025-05-25T16:00:00.000Z",
                endTime: "2025-05-25T19:12:00.000Z",
                isLastShow: false,
                isFirstShow: false,
                seatsAvailable: 0,
                seatsBooked: 120,
                createdAt: "2025-05-01T10:00:00.000Z",
                updatedAt: "2025-05-01T10:00:00.000Z",
            },
        ]

        return {
            showtimes: mockShowtimes,
            page: 1,
            pages: 1,
            total: mockShowtimes.length,
        }
    },

    async createShowtime(data) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return { success: true }
    },

    async updateShowtime(id, data) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return { success: true }
    },

    async deleteShowtime(id) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return { success: true }
    },
}

const movieService = {
    async getMovies() {
        return {
            movies: [
                { _id: "6837e2a9dbcf9e3ee9724aab", title: "Siêu Anh Hùng Báo Thù Trở Lại" },
                { _id: "6837e2a9dbcf9e3ee9724aac", title: "Người Nhện: Không Còn Nhà" },
                { _id: "6837e2a9dbcf9e3ee9724aad", title: "Avatar: Dòng Chảy Của Nước" },
            ],
        }
    },
}

const AdminShowtimes = () => {
    const [showtimes, setShowtimes] = useState([])
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [editingShowtime, setEditingShowtime] = useState(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showtimeToDelete, setShowtimeToDelete] = useState(null)
    const [filters, setFilters] = useState({
        movieId: "all",
        branchId: "all",
        theaterId: "all",
        date: "",
        search: "",
    })
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
    })

    useEffect(() => {
        fetchData()
    }, [filters, pagination.page])

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            const [showtimesData, moviesData] = await Promise.all([fetchShowtimes(), fetchMovies()])
        } catch (error) {
            console.error("Error fetching data:", error)
            setError("Failed to load data. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const fetchShowtimes = async () => {
        try {
            const params = {
                page: pagination.page,
                limit: 12,
                ...filters,
            }

            // Remove empty filters
            Object.keys(params).forEach((key) => {
                if (params[key] === "all" || params[key] === "") delete params[key]
            })

            const data = await showtimeService.getShowtimes(params)
            setShowtimes(data.showtimes || [])
            setPagination({
                page: data.page || 1,
                pages: data.pages || 1,
                total: data.total || 0,
            })

            return data
        } catch (error) {
            console.error("Error fetching showtimes:", error)
            throw error
        }
    }

    const fetchMovies = async () => {
        try {
            const data = await movieService.getMovies({ limit: 100 })
            setMovies(data.movies || [])
            return data
        } catch (error) {
            console.error("Error fetching movies:", error)
            throw error
        }
    }

    const handleCreateShowtime = () => {
        setEditingShowtime(null)
        setShowForm(true)
    }

    const handleEditShowtime = (showtime) => {
        setEditingShowtime(showtime)
        setShowForm(true)
    }

    const handleDeleteShowtime = (showtime) => {
        setShowtimeToDelete(showtime)
        setShowDeleteDialog(true)
    }

    const confirmDeleteShowtime = async () => {
        try {
            await showtimeService.deleteShowtime(showtimeToDelete._id)
            setShowDeleteDialog(false)
            setShowtimeToDelete(null)
            fetchData()
        } catch (error) {
            console.error("Error deleting showtime:", error)
            setError("Failed to delete showtime")
        }
    }

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }))
        setPagination((prev) => ({ ...prev, page: 1 }))
    }

    // Helper functions for your database structure
    const getShowtimeStatus = (showtime) => {
        const now = new Date()
        const startTime = new Date(showtime.startTime)
        const endTime = new Date(showtime.endTime)

        if (showtime.seatsAvailable === 0) return "sold-out"
        if (now < startTime) return "scheduled"
        if (now >= startTime && now <= endTime) return "ongoing"
        if (now > endTime) return "completed"
        return "scheduled"
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "scheduled":
                return "bg-blue-100 text-blue-800"
            case "ongoing":
                return "bg-green-100 text-green-800"
            case "completed":
                return "bg-gray-100 text-gray-800"
            case "cancelled":
                return "bg-red-100 text-red-800"
            case "sold-out":
                return "bg-orange-100 text-orange-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString)
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    const getTotalSeats = (showtime) => {
        return showtime.seatsAvailable + showtime.seatsBooked
    }

    const getOccupancyRate = (showtime) => {
        const total = getTotalSeats(showtime)
        return total > 0 ? Math.round((showtime.seatsBooked / total) * 100) : 0
    }

    // Get unique branches and theaters for filters
    const uniqueBranches = [...new Set(showtimes.map((s) => s.branch.name))]
    const uniqueTheaters = [...new Set(showtimes.map((s) => s.theater.name))]

    if (loading && showtimes.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải lịch chiếu...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản Lý Lịch Chiếu</h1>
                    <p className="text-gray-600 mt-2">Quản lý lịch chiếu phim và thời gian biểu của rạp</p>
                </div>
                <Button onClick={handleCreateShowtime} className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm Lịch Chiếu Mới
                </Button>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
            )}

            {/* Filters */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Bộ Lọc
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phim</label>
                            <Select value={filters.movieId} onValueChange={(value) => handleFilterChange("movieId", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tất cả phim" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả phim</SelectItem>
                                    {movies.map((movie) => (
                                        <SelectItem key={movie._id} value={movie._id}>
                                            {movie.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chi nhánh</label>
                            <Select value={filters.branchId} onValueChange={(value) => handleFilterChange("branchId", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tất cả chi nhánh" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                                    {uniqueBranches.map((branch) => (
                                        <SelectItem key={branch} value={branch}>
                                            {branch}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phòng chiếu</label>
                            <Select value={filters.theaterId} onValueChange={(value) => handleFilterChange("theaterId", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tất cả phòng" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả phòng</SelectItem>
                                    {uniqueTheaters.map((theater) => (
                                        <SelectItem key={theater} value={theater}>
                                            {theater}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày</label>
                            <Input type="date" value={filters.date} onChange={(e) => handleFilterChange("date", e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange("search", e.target.value)}
                                    placeholder="Tìm kiếm lịch chiếu..."
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Tổng lịch chiếu</p>
                                <p className="text-2xl font-semibold text-gray-900">{pagination.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Suất chiếu hôm nay</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {
                                        showtimes.filter((s) => {
                                            const today = new Date().toDateString()
                                            const showDate = new Date(s.startTime).toDateString()
                                            return today === showDate
                                        }).length
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-red-100 text-red-600">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Chi nhánh hoạt động</p>
                                <p className="text-2xl font-semibold text-gray-900">{uniqueBranches.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                <Film className="w-6 h-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Phim đang chiếu</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {new Set(showtimes.map((s) => s.movie._id)).size}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Showtimes Grid */}
            {showtimes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {showtimes.map((showtime) => {
                        const status = getShowtimeStatus(showtime)
                        const occupancyRate = getOccupancyRate(showtime)

                        return (
                            <Card key={showtime._id} className="relative hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">{showtime.movie.title}</CardTitle>
                                            <CardDescription className="text-sm text-gray-600">
                                                {showtime.movie.duration} phút
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Badge className={getStatusColor(status)}>
                                                {status === "scheduled" && "Đã lên lịch"}
                                                {status === "ongoing" && "Đang chiếu"}
                                                {status === "completed" && "Đã kết thúc"}
                                                {status === "sold-out" && "Hết vé"}
                                            </Badge>
                                            {showtime.isFirstShow && (
                                                <Badge variant="outline" className="text-xs">
                                                    Suất đầu
                                                </Badge>
                                            )}
                                            {showtime.isLastShow && (
                                                <Badge variant="outline" className="text-xs">
                                                    Suất cuối
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        {showtime.branch.name}
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600">
                                        <Film className="w-4 h-4 mr-2" />
                                        {showtime.theater.name}
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {formatDateTime(showtime.startTime)} - {formatDateTime(showtime.endTime)}
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600">
                                        <Users className="w-4 h-4 mr-2" />
                                        {showtime.seatsAvailable}/{getTotalSeats(showtime)} ghế trống ({occupancyRate}% đã đặt)
                                    </div>

                                    {/* Price Information */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center mb-2">
                                            <DollarSign className="w-4 h-4 mr-1" />
                                            <span className="text-sm font-medium">Giá vé:</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div className="text-center">
                                                <div className="font-medium">Thường</div>
                                                <div className="text-green-600">{formatPrice(showtime.price.standard)}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-medium">VIP</div>
                                                <div className="text-green-600">{formatPrice(showtime.price.vip)}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-medium">Đôi</div>
                                                <div className="text-green-600">{formatPrice(showtime.price.couple)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <div className="text-xs text-gray-500">{showtime.branch.location.city}</div>
                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="outline" onClick={() => handleEditShowtime(showtime)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDeleteShowtime(showtime)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <Card className="text-center py-12">
                    <CardContent>
                        <div className="text-gray-500 mb-4">
                            <Clock className="mx-auto h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy lịch chiếu</h3>
                        <p className="text-gray-500 mb-4">
                            {filters.search ||
                            filters.movieId !== "all" ||
                            filters.branchId !== "all" ||
                            filters.theaterId !== "all" ||
                            filters.date
                                ? "Thử điều chỉnh bộ lọc để xem thêm kết quả."
                                : "Bắt đầu bằng cách tạo lịch chiếu đầu tiên."}
                        </p>
                        <Button onClick={handleCreateShowtime} className="bg-red-600 hover:bg-red-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm Lịch Chiếu Mới
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                    >
                        Trước
                    </Button>

                    {[...Array(pagination.pages)].map((_, index) => {
                        const page = index + 1
                        return (
                            <Button
                                key={page}
                                variant={pagination.page === page ? "default" : "outline"}
                                onClick={() => setPagination((prev) => ({ ...prev, page }))}
                                className={pagination.page === page ? "bg-red-600 hover:bg-red-700" : ""}
                            >
                                {page}
                            </Button>
                        )
                    })}

                    <Button
                        variant="outline"
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.pages}
                    >
                        Sau
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xóa Lịch Chiếu</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa lịch chiếu phim "{showtimeToDelete?.movie?.title}" lúc{" "}
                            {showtimeToDelete && formatDateTime(showtimeToDelete.startTime)}? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Hủy
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteShowtime}>
                            Xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Loading Overlay */}
            {loading && showtimes.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải...</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminShowtimes
