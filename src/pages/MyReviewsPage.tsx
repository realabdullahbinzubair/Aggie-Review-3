import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trash2, Calendar } from 'lucide-react';
import NavBar from '../components/NavBar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Review } from '../types';

export default function MyReviewsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadReviews();
  }, [user]);

  const loadReviews = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('reviews')
      .select('*, professor:professors(*, department:departments(*)), course:courses(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const handleDelete = async (reviewId: string, professorId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    setDeletingId(reviewId);

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (!error) {
      const { data: remainingReviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('professor_id', professorId);

      if (remainingReviews && remainingReviews.length > 0) {
        const avgRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length;
        const avgDifficulty = remainingReviews.reduce((sum, r) => sum + r.difficulty, 0) / remainingReviews.length;
        const wouldTakeAgainCount = remainingReviews.filter(r => r.would_take_again).length;
        const wouldTakeAgainPercent = (wouldTakeAgainCount / remainingReviews.length) * 100;

        await supabase
          .from('professors')
          .update({
            average_rating: Math.round(avgRating * 10) / 10,
            difficulty_rating: Math.round(avgDifficulty * 10) / 10,
            would_take_again_percent: Math.round(wouldTakeAgainPercent),
            total_reviews: remainingReviews.length,
          })
          .eq('id', professorId);
      } else {
        await supabase
          .from('professors')
          .update({
            average_rating: 0,
            difficulty_rating: 0,
            would_take_again_percent: 0,
            total_reviews: 0,
          })
          .eq('id', professorId);
      }

      setReviews(reviews.filter(r => r.id !== reviewId));
    }

    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">My Reviews</h2>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">You haven't written any reviews yet.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-ncat-gold hover:bg-ncat-blue text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Search Professors
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {review.professor?.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {review.professor?.department?.name}
                    </p>
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            className={i < review.rating ? 'text-ncat-gold' : 'text-gray-300'}
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
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      {review.grade_received && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          Grade: {review.grade_received}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(review.id, review.professor_id)}
                    disabled={deletingId === review.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete review"
                  >
                    <Trash2 size={20} />
                  </button>
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
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-ncat-gold-light/20 text-ncat-blue-dark">
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
      </main>
    </div>
  );
}
