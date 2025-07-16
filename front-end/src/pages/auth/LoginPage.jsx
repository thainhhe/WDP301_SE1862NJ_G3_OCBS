import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, user } = useAuth();
  const navigate = useNavigate(); // Khởi tạo navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password); // Lấy kết quả true/false
    if (success) {
      // Lấy userInfo từ localStorage để đảm bảo dữ liệu mới nhất
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      console.log("User info:", userInfo);
      if (userInfo && userInfo.role === "admin") {
        navigate("/admin/dashboard");
      } else if (userInfo && userInfo.role === "employee") {
        navigate("/admin/employee-dashboard");
      } else {
        navigate("/");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white bg-opacity-95 rounded-3xl shadow-2xl p-10 space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            Đăng nhập
          </h2>
          <p className="text-gray-500 mb-4">
            Đăng nhập để đặt vé, quản lý tài khoản và nhận ưu đãi hấp dẫn!
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-100 p-4 border border-red-300">
              <div className="text-sm text-red-700 font-medium">{error}</div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label
                htmlFor="email-address"
                className="block text-gray-700 font-semibold mb-1"
              >
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 font-semibold mb-1"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg shadow-lg hover:from-purple-600 hover:to-indigo-600 transition"
          >
            Đăng nhập
          </button>
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Đăng ký
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
