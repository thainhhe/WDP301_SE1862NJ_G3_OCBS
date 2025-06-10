import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "@components/layout/Layout";
import AuthLayout from "@components/layout/AuthLayout";
import PrivateRoute from "@components/auth/PrivateRoute";
import LoadingSpinner from "@components/ui/LoadingSpinner";

// Lazy loaded pages
const Home = lazy(() => import("@pages/Home"));
const Login = lazy(() => import("@pages/auth/LoginPage"));
const Register = lazy(() => import("@pages/auth/RegisterPage"));
const ForgotPassword = lazy(() => import("@pages/auth/ForgotPasswordPage"));
const ResetPassword = lazy(() => import("@pages/auth/ResetPasswordPage"));
const Profile = lazy(() => import("@pages/profile/ProfilePage"));
const AdminMovies = lazy(() => import("@pages/admin/AdminMovies"));

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Auth Layout Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/reset-password/:resettoken"
              element={<ResetPassword />}
            />
          </Route>

          {/* Main Layout Routes */}
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="admin/movies" element={<AdminMovies />} />
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
