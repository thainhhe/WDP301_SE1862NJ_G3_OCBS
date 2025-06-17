import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Thêm hook navigate

  // Cập nhật: Tạo hàm xử lý logout
  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate('/login'); // Điều hướng sau khi logout thành công
    }
  };

  return (
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-indigo-600">
                  OCBS
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                    to="/"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                    to="/movies"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Movies
                </Link>


                {user && user.role === 'admin' && (
                    <Link
                        to="/userList"
                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      User Management
                    </Link>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {user ? (
                  <div className="flex items-center space-x-4">
                    <Link
                        to="/profile"
                        className="text-gray-700 hover:text-indigo-600 transition-colors"
                    >
                      Welcome, {user.name}
                    </Link>
                    <button
                        onClick={handleLogout} // Cập nhật: Gọi hàm handleLogout
                        className="text-gray-500 hover:text-gray-700"
                    >
                      Logout
                    </button>
                  </div>
              ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                        to="/login"
                        className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Sign in
                    </Link>
                    <Link
                        to="/register"
                        className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Sign up
                    </Link>
                  </div>
              )}
            </div>
          </div>
        </nav>
      </header>
  );
};

export default Header;