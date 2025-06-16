import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { movieService } from "@services/movieService";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import MovieCard from "@components/movies/MovieCard";

const Home = () => {
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const [nowShowingData, comingSoonData, trendingData, recommendedData] =
        await Promise.all([
          movieService.getMovies({ status: "now-showing", limit: 8 }),
          movieService.getMovies({ status: "coming-soon", limit: 8 }),
          movieService.getTrendingMovies(6),
          movieService.getRecommendedMovies(),
        ]);

      setNowShowing(nowShowingData.movies || []);
      setComingSoon(comingSoonData.movies || []);
      setTrending(trendingData || []);
      setRecommended(recommendedData || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 z-10"></div>
          <img
            src="http://localhost:5000/uploads/posters/tom-cruise-last-mission-impossible-movie.webp"
            alt="Latest Movies"
            className="w-full h-full object-cover object-center transform scale-105 hover:scale-110 transition-transform duration-700"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Cinema
              </span>
              <br />
              <span className="text-4xl md:text-6xl">Experience</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl leading-relaxed">
              Immerse yourself in the ultimate movie experience with premium
              comfort, cutting-edge technology, and the latest blockbusters
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/movies"
                className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-2xl transition-all duration-300 hover:from-red-700 hover:to-pink-700 shadow-2xl hover:shadow-red-500/25 transform hover:-translate-y-1"
              >
                <span className="relative z-10">Explore Movies</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                to="/showtimes"
                className="px-8 py-4 border-2 border-white text-white font-bold rounded-2xl hover:bg-white hover:text-gray-900 transition-all duration-300 backdrop-blur-sm"
              >
                View Showtimes
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-bounce"></div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Trending Movies Section */}
        {trending.length > 0 && (
          <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Trending Now
                  </h2>
                  <p className="text-gray-600">
                    Hot picks everyone's talking about
                  </p>
                </div>
              </div>
              <Link
                to="/movies?sortBy=hotness"
                className="group flex items-center space-x-2 text-red-600 hover:text-red-700 font-semibold bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all duration-200"
              >
                <span>View All</span>
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {trending.map((movie, index) => (
                <div
                  key={movie._id}
                  className="transform hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Now Showing Section */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Now Showing
                </h2>
                <p className="text-gray-600">Currently playing in theaters</p>
              </div>
            </div>
            <Link
              to="/movies?status=now-showing"
              className="group flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all duration-200"
            >
              <span>View All</span>
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {nowShowing.map((movie, index) => (
              <div
                key={movie._id}
                className="transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>

        {/* Recommended Section */}
        {recommended.length > 0 && (
          <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Recommended For You
                  </h2>
                  <p className="text-gray-600">Handpicked just for you</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {recommended.map((movie, index) => (
                <div
                  key={movie._id}
                  className="transform hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Coming Soon Section */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Coming Soon
                </h2>
                <p className="text-gray-600">
                  Upcoming blockbusters to watch out for
                </p>
              </div>
            </div>
            <Link
              to="/movies?status=coming-soon"
              className="group flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-semibold bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-all duration-200"
            >
              <span>View All</span>
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {comingSoon.map((movie, index) => (
              <div
                key={movie._id}
                className="transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>

        {/* Special Offers Section */}
        <section className="mb-16">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Special Offers
              </h2>
              <p className="text-gray-600">Exclusive deals and promotions</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold">Student Discount</h3>
                </div>
                <p className="text-purple-100 mb-6 text-lg leading-relaxed">
                  Show your student ID and get 20% off on all movie tickets.
                  Valid for all screenings, all days of the week.
                </p>
                <Link
                  to="/promotions"
                  className="inline-flex items-center space-x-2 bg-white text-purple-700 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-200 transform group-hover:translate-x-1"
                >
                  <span>Learn More</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl p-8 text-white shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM13 8a5 5 0 00-5 5v1H3a3 3 0 015-2.83V8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold">Family Package</h3>
                </div>
                <p className="text-orange-100 mb-6 text-lg leading-relaxed">
                  Perfect for family movie nights! Get discounted tickets for 4+
                  people plus complimentary popcorn and drinks.
                </p>
                <Link
                  to="/promotions"
                  className="inline-flex items-center space-x-2 bg-white text-orange-700 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-200 transform group-hover:translate-x-1"
                >
                  <span>Learn More</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of cinema with our premium services and
              cutting-edge technology
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Premium Quality
              </h3>
              <p className="text-gray-600 leading-relaxed">
                State-of-the-art sound systems, 4K projection, and comfortable
                luxury seating for the ultimate viewing experience.
              </p>
            </div>

            <div className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Easy Booking
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Simple, fast, and secure online booking system. Reserve your
                seats in just a few clicks, anytime, anywhere.
              </p>
            </div>

            <div className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Best Prices
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Competitive pricing with exclusive deals, student discounts, and
                family packages. Great entertainment shouldn't break the bank.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
