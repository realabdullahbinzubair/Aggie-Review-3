import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import SearchBar from '../components/SearchBar';
import { TrendingUp, Users, Star } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleSearch = (query: string, type: 'professor' | 'course') => {
    if (type === 'professor') {
      navigate(`/professor?search=${encodeURIComponent(query)}`);
    } else {
      navigate(`/course?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Professor
          </h2>
          <p className="text-xl text-gray-600">
            Real reviews from NC A&T students
          </p>
        </div>

        <SearchBar onSearch={handleSearch} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-ncat-gold-light/20 rounded-full p-4">
                <Users size={32} className="text-ncat-blue" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Community Driven
            </h3>
            <p className="text-gray-600">
              Reviews written by students, for students
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-ncat-gold-light/20 rounded-full p-4">
                <Star size={32} className="text-ncat-blue" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Honest Ratings
            </h3>
            <p className="text-gray-600">
              Authentic feedback on teaching style and course difficulty
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-ncat-gold-light/20 rounded-full p-4">
                <TrendingUp size={32} className="text-ncat-blue" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Make Better Choices
            </h3>
            <p className="text-gray-600">
              Plan your schedule with confidence
            </p>
          </div>
        </div>

        <div className="mt-16 bg-ncat-gold-light/10 border-l-4 border-ncat-gold p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Want to leave a review?
          </h3>
          <p className="text-gray-700 mb-4">
            Sign in with your NC A&T email to share your experience and help other Aggies!
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-ncat-gold hover:bg-ncat-blue text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Sign In to Review
          </button>
        </div>
      </main>
    </div>
  );
}
