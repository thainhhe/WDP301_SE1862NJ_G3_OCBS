import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Register user
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  if (response.data) {
    localStorage.setItem('userInfo', JSON.stringify(response.data));
  }
  return response.data;
};

// Login user
const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });

  // Kiểm tra xem có dữ liệu trả về không
  if (response.data) {
    // Lưu toàn bộ thông tin người dùng vào 'userInfo'
    localStorage.setItem('userInfo', JSON.stringify(response.data));

    // Trích xuất token từ response.data và lưu vào 'authToken'
    localStorage.setItem('authToken', response.data.token);
  }

  return response.data;
};

// Logout user
const logout = async () => {
  await axios.post(`${API_URL}/logout`);
  localStorage.removeItem('userInfo');
  localStorage.removeItem('authToken');
};

// Get user profile
const getUserProfile = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/profile`, config);
  return response.data;
};

// Update user profile
const updateUserProfile = async (userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${API_URL}/profile`, userData, config);
  if (response.data) {
    localStorage.setItem('userInfo', JSON.stringify(response.data));
  }
  return response.data;
};

// Forgot password
const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

// Reset password
const resetPassword = async (password, token) => {
  const response = await axios.put(`${API_URL}/reset-password/${token}`, { password });
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
};

export default authService; 