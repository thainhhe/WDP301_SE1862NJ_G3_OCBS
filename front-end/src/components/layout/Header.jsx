import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          CinemaTickets
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-red-400">
            Home
          </Link>
          <Link to="/movies" className="hover:text-red-400">
            Movies
          </Link>
          <Link to="/admin/movies" className="hover:text-red-400">
            Manage Movies
          </Link>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 px-4 py-2">
          <Link to="/" className="block py-2 hover:text-red-400">
            Home
          </Link>
          <Link to="/movies" className="block py-2 hover:text-red-400">
            Movies
          </Link>
          <Link to="/admin/movies" className="block py-2 hover:text-red-400">
            Manage Movies
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
