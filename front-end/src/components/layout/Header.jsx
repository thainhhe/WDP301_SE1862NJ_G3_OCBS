import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate("/login");
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 3a2 2 0 00-2 2v1.816a.5.5 0 00.316.464l2 .8a.5.5 0 01.316.464V14a2 2 0 002 2h8a2 2 0 002-2V8.264a.5.5 0 01.316-.464l2-.8A.5.5 0 0018 6.816V5a2 2 0 00-2-2H4z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                OCBS
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
            >
              Home
            </Link>
            <Link
              to="/movies"
              className="px-4 py-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
            >
              Movies
            </Link>
            <Link
              to="/showtimes"
              className="px-4 py-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
            >
              Showtimes
            </Link>
            {user && user.role === "admin" && (
              <Link
                to="/userList"
                className="px-4 py-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
              >
                Management
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-red-600 transition-colors font-medium"
                  >
                    {user.name}
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg border-t border-gray-100">
            <div className="px-4 py-6 space-y-3">
              <Link
                to="/"
                className="block px-4 py-3 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/movies"
                className="block px-4 py-3 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Movies
              </Link>
              <Link
                to="/showtimes"
                className="block px-4 py-3 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Showtimes
              </Link>
              {user && user.role === "admin" && (
                <Link
                  to="/userList"
                  className="block px-4 py-3 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Management
                </Link>
              )}

              <div className="border-t border-gray-200 pt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-4 py-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <Link
                        to="/profile"
                        className="text-gray-700 hover:text-red-600 transition-colors font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {user.name}
                      </Link>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="block px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 font-medium text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
