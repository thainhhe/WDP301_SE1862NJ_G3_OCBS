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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 mb-12 rounded-xl overflow-hidden mx-4 mt-8">
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <img
          src="/placeholder.svg?height=400&width=1200"
          alt="Latest Movies"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Experience Movies Like Never Before
          </h1>
          <p className="text-xl text-white mb-6 max-w-2xl">
            Book your tickets online and enjoy the latest blockbusters in
            premium comfort
          </p>
          <Link
            to="/showtimes"
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
          >
            Book Now
          </Link>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Trending Movies Section */}
        {trending.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                🔥 Trending Now
              </h2>
              <Link
                to="/movies?sortBy=hotness"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {trending.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Now Showing Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Now Showing</h2>
            <Link
              to="/movies?status=now-showing"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nowShowing.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Recommended For You Section */}
        {recommended.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Recommended For You
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommended.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Coming Soon Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Coming Soon</h2>
            <Link
              to="/movies?status=coming-soon"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {comingSoon.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Promotions Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Special Offers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Student Discount</h3>
              <p className="mb-4">
                Get 20% off on all movie tickets with your student ID
              </p>
              <Link
                to="/promotions"
                className="inline-block bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium"
              >
                Learn More
              </Link>
            </div>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Family Package</h3>
              <p className="mb-4">
                Special family combo with discounted tickets and snacks
              </p>
              <Link
                to="/promotions"
                className="inline-block bg-white text-orange-600 px-4 py-2 rounded-lg font-medium"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
