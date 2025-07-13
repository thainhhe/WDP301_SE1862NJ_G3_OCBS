import { createBrowserRouter, Navigate, Route } from "react-router-dom";

// Layouts
import Layout from "@components/layout/Layout";
import AuthLayout from "@components/layout/AuthLayout";

// Components
import ProtectedRoute from "@router/ProtectedRoute";

// Pages
import Home from "@pages/Home";
import Movies from "@pages/Movies";
import ShowtimesPage from "@pages/ShowtimesPage";
import ProfilePage from "@pages/profile/ProfilePage";
import MovieDetails from "@pages/MovieDetails";
import SeatSelectionPage from "@pages/SeatSelectionPage";
import BookingPage from "@pages/BookingPage";
import BookingReviewPage from "../pages/BookingReviewPage";

// Auth Pages
import LoginPage from "@pages/auth/LoginPage";
import RegisterPage from "@pages/auth/RegisterPage";
import ForgotPasswordPage from "@pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@pages/auth/ResetPasswordPage";

// Admin Pages
import UserList from "@pages/admin/UserManagement/UserList";
import AdminMovies from "@pages/admin/AdminMovies";
import DashboardLayout from "@/layout/DashboardLayout.jsx";
import AdminDashboardPage from "@pages/admin/AdminDashboardPage.jsx";
import AdminShowtimes from "@pages/admin/AdminShowtime.jsx";
import SeatLayoutManagement from "@pages/admin/SeatLayoutManagement";
import AdminVouchers from "@pages/admin/AdminVouchers.jsx";
import AdminCombos from "../pages/admin/AdminCombos.jsx";
// Employee Pages
import EmployeeDashboardPage from "@pages/EmployeeDashboardPage.jsx";
import EmployeeQRCheckin from "@/pages/EmployeeQRCheckin";
import EmployeeBookTicket from "@/pages/EmployeeBookTicket";
import EmployeeBookingsPage from "@/pages/EmployeeBookingsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // --- Public Routes ---
      { index: true, element: <Home /> },
      { path: "movies", element: <Movies /> },
      { path: "movies/:id", element: <MovieDetails /> },
      { path: "showtimes", element: <ShowtimesPage /> },
      {
        path: "seat-selection/:showtimeId",
        element: (
          <ProtectedRoute>
            <SeatSelectionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "booking/:bookingId",
        element: (
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "booking-review",
        element: <BookingReviewPage />,
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },

      // --- Employee & Admin Routes ---
      // Ví dụ: Employee có thể truy cập dashboard của mình
      // {
      //   path: 'employee/dashboard',
      //   element: (
      //     <ProtectedRoute allowedRoles={['employee', 'admin']}>
      //       <EmployeeDashboard />
      //     </ProtectedRoute>
      //   )
      // },
      // {
      //   path: "admin/movies",
      //   element: (
      //     <ProtectedRoute allowedRoles={["admin"]}>
      //       <AdminMovies />
      //     </ProtectedRoute>
      //   ),
      // },
    ],
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password/:resettoken", element: <ResetPasswordPage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin", "employee"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboardPage /> },
      { path: "employee-dashboard", element: <EmployeeDashboardPage /> },
      { path: "movies", element: <AdminMovies /> },
      { path: "showtimes", element: <AdminShowtimes /> },
      { path: "users", element: <UserList /> },
      { path: "seat-layouts", element: <SeatLayoutManagement /> },
      { path: "vouchers", element: <AdminVouchers /> },
      { path: "combos", element: <AdminCombos /> },
      { path: "qr-checkin", element: <ProtectedRoute allowedRoles={["employee"]}><EmployeeQRCheckin /></ProtectedRoute> },
      { path: "employee-book-ticket", element: <ProtectedRoute allowedRoles={["employee"]}><EmployeeBookTicket /></ProtectedRoute> },
      { path: "employee-bookings", element: <ProtectedRoute allowedRoles={["employee"]}><EmployeeBookingsPage /></ProtectedRoute> },
    ],
  },
]);

export default router;
