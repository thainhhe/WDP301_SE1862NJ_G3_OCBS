import { createContext, useContext, useState, useEffect } from "react";
// Bỏ import useNavigate
// import { useNavigate } from 'react-router-dom';
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      const data = await authService.register(userData);
      setUser(data);
      return true;
    } catch (err) {
      setError(
          err.response?.data?.message || "An error occurred during registration"
      );
      // Trả về false khi thất bại
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const data = await authService.login(email, password);
      setUser(data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      return true;
    } catch (err) {
      console.error("Logout error:", err);
      // Trả về false khi thất bại
      return false;
    }
  };

  // Các hàm còn lại không thay đổi
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const data = await authService.updateUserProfile(userData, user.token);
      setUser(data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Error updating profile");
      return false;
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      await authService.forgotPassword(email);
      return true;
    } catch (err) {
      setError(
          err.response?.data?.message || "Error processing forgot password request"
      );
      return false;
    }
  };

  const resetPassword = async (password, token) => {
    try {
      setError(null);
      await authService.resetPassword(password, token);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Error resetting password");
      return false;
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};