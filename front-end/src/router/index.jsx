import { createBrowserRouter, Route } from "react-router-dom";

// Layouts
import Layout from "@components/layout/Layout";
import AuthLayout from "@components/layout/AuthLayout";

// Components
import ProtectedRoute from "@router/ProtectedRoute";

// Pages
import Home from "@pages/Home";
import Movies from "@pages/Movies";
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // --- Public Routes ---
      { index: true, element: <Home /> },
      { path: "movies", element: <Movies /> },
      { path: "movies/:id", element: <MovieDetails /> },

      // --- Authenticated User Routes (customer, employee, admin) ---
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

      // --- Admin Only Routes ---
      // Ví dụ: Chỉ admin mới có thể truy cập trang quản lý người dùng
      {
        path: "userList",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserList />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/movies",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminMovies />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    // Layout riêng cho các trang xác thực (login, register, ...)
    path: "/",
    element: <AuthLayout />, // Layout này không có footer
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password/:resettoken", element: <ResetPasswordPage /> },
    ],
  },
  // Thêm các route không tìm thấy (404 Not Found) ở đây nếu cần
  // { path: '*', element: <NotFoundPage /> }
]);

export default router;
