import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, ThumbsUp, TrendingUp, MessageSquarePlus, Calendar, ArrowLeft } from 'lucide-react';
import NavBar from '../components/NavBar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Professor, Review, Course } from '../types';
import ReviewFormModal from '../components/ReviewFormModal';

export default function ProfessorSearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    searchProfessors();
  }, [searchQuery]);

  useEffect(() => {
    if (selectedProfessor) {
      loadReviews(selectedProfessor.id);
    }
  }, [selectedProfessor]);

  const searchProfessors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('professors')
      .select('*, department:departments(*)')
      .ilike('name', `%${searchQuery}%`)
      .order('name');

    if (!error && data) {
      setProfessors(data);
      if (data.length === 1) {
        setSelectedProfessor(data[0]);
      }
    }
    setLoading(false);
  };

  const loadReviews = async (professorId: string) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, course:courses(*), profile:profiles(*)')
      .eq('professor_id', professorId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
  };

  const handleReviewSubmitted = () => {
    if (selectedProfessor) {
      loadReviews(selectedProfessor.id);
      searchProfessors();
    }
    setShowReviewForm(false);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-500';
    if (rating >= 3.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (selectedProfessor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setSelectedProfessor(null)}
            className="flex items-center space-x-2 text-gray-600 hover:text-yellow-600 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to search results</span>
          </button>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedProfessor.name}</h2>
                <p className="text-lg text-gray-600">{selectedProfessor.title}</p>
                <p className="text-gray-500">{selectedProfessor.department?.name}</p>
              </div>
              {user && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="mt-4 md:mt-0 flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
                >
                  <MessageSquarePlus size={20} />
                  <span>Rate Professor</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <div className={`w-20 h-20 rounded-full ${getRatingColor(selectedProfessor.average_rating)} flex items-center justify-center text-white text-2xl font-bold`}>
                    {selectedProfessor.average_rating.toFixed(1)}
                  </div>
                </div>
                <div className="flex items-center justify-center text-yellow-500 mb-1">
                  <Star size={18} fill="currentColor" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Overall Rating</p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <ThumbsUp size={32} className="text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {selectedProfessor.would_take_again_percent}%
                </p>
                <p className="text-sm text-gray-600 font-medium">Would take again</p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp size={32} className="text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {selectedProfessor.difficulty_rating.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 font-medium">Level of Difficulty</p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <MessageSquarePlus size={32} className="text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {selectedProfessor.total_reviews}
                </p>
                <p className="text-sm text-gray-600 font-medium">Student Ratings</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Student Reviews ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg mb-4">No reviews yet for this professor.</p>
                {user && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="inline-flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <MessageSquarePlus size={20} />
                    <span>Be the first to review</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={20}
                                className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                                fill={i < review.rating ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {review.course?.code}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                          </span>
                          {review.grade_received && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              Grade: {review.grade_received}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        review.would_take_again
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {review.would_take_again ? 'Would take again' : 'Would not take again'}
                      </span>

                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Difficulty: {review.difficulty}/5
                      </span>

                      {review.attendance_mandatory && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Attendance mandatory
                        </span>
                      )}

                      {review.for_credit && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Taken for credit
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {showReviewForm && (
          <ReviewFormModal
            professor={selectedProfessor}
            onClose={() => setShowReviewForm(false)}
            onSubmit={handleReviewSubmitted}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Search Results for "{searchQuery}"
        </h2>

        {professors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No professors found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professors.map((professor) => (
              <button
                key={professor.id}
                onClick={() => setSelectedProfessor(professor)}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 text-left border border-gray-100 hover:border-yellow-400"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-1">{professor.name}</h3>
                <p className="text-gray-600 text-sm mb-1">{professor.title}</p>
                <p className="text-gray-500 text-sm mb-4">{professor.department?.name}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {professor.average_rating.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {professor.total_reviews}
                    </div>
                    <div className="text-xs text-gray-500">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {professor.would_take_again_percent}%
                    </div>
                    <div className="text-xs text-gray-500">Would Take</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
