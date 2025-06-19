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
      { path: "movies", element: <AdminMovies /> },
      { path: "showtimes", element: <AdminShowtimes /> },
      { path: "users", element: <UserList /> },
      { path: "seat-layouts", element: <SeatLayoutManagement /> },
    ],
  },
]);

export default router;
