import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, BookOpen, ArrowLeft, User } from 'lucide-react';
import NavBar from '../components/NavBar';
import { supabase } from '../lib/supabase';
import { Course, Review } from '../types';

export default function CourseProfilePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const courseCode = searchParams.get('code') || '';

  useEffect(() => {
    loadCourseAndReviews();
  }, [courseCode]);

  const loadCourseAndReviews = async () => {
    setLoading(true);

    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*, department:departments(*)')
      .eq('code', courseCode)
      .single();

    if (!courseError && courseData) {
      setCourse(courseData);

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*, professor:professors(*), course:courses(*)')
        .eq('course_id', courseData.id)
        .order('created_at', { ascending: false });

      if (!reviewsError && reviewsData) {
        setReviews(reviewsData);
      }
    }

    setLoading(false);
  };

  const professorStats = reviews.reduce((acc, review) => {
    const profId = review.professor_id;
    if (!acc[profId]) {
      acc[profId] = {
        professor: review.professor,
        reviews: [],
        avgRating: 0,
        avgDifficulty: 0,
        wouldTakeAgainPercent: 0
      };
    }
    acc[profId].reviews.push(review);
    return acc;
  }, {} as Record<string, any>);

  Object.values(professorStats).forEach((stats: any) => {
    const reviewCount = stats.reviews.length;
    stats.avgRating = stats.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviewCount;
    stats.avgDifficulty = stats.reviews.reduce((sum: number, r: Review) => sum + r.difficulty, 0) / reviewCount;
    const wouldTakeAgainCount = stats.reviews.filter((r: Review) => r.would_take_again).length;
    stats.wouldTakeAgainPercent = (wouldTakeAgainCount / reviewCount) * 100;
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-500';
    if (rating >= 3.5) return 'bg-ncat-gold';
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

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-gray-500">Course not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-ncat-blue mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to course search</span>
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <BookOpen className="text-ncat-blue" size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{course.code}</h1>
                  <p className="text-lg text-gray-600">{course.name}</p>
                </div>
              </div>
              <p className="text-ncat-blue font-medium mt-2">{course.department?.name}</p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">{reviews.length}</div>
              <div className="text-sm text-gray-500">Total Reviews</div>
            </div>
          </div>
        </div>

        {Object.values(professorStats).length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No reviews yet for this course.</p>
            <p className="text-gray-400 mt-2">Be the first to review a professor who teaches this course!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Professors Teaching This Course</h2>

            {Object.values(professorStats).map((stats: any) => (
              <div key={stats.professor.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <button
                      onClick={() => navigate(`/professor?search=${encodeURIComponent(stats.professor.name)}`)}
                      className="text-xl font-bold text-ncat-blue hover:text-ncat-blue-dark transition-colors"
                    >
                      {stats.professor.name}
                    </button>
                    <p className="text-gray-600">{stats.professor.title}</p>
                  </div>

                  <div className="flex space-x-4">
                    <div className="text-center">
                      <div className={`${getRatingColor(stats.avgRating)} text-white px-4 py-2 rounded-lg font-bold text-xl`}>
                        {stats.avgRating.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Overall</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold text-xl">
                        {stats.avgDifficulty.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Difficulty</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-ncat-blue text-white px-4 py-2 rounded-lg font-bold text-xl">
                        {Math.round(stats.wouldTakeAgainPercent)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Would Take Again</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <User size={18} />
                    <span>Reviews ({stats.reviews.length})</span>
                  </h3>

                  {stats.reviews.map((review: Review) => (
                    <div key={review.id} className="border-l-4 border-ncat-gold pl-4 py-2">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-1">
                          <Star className="text-ncat-gold fill-ncat-gold" size={16} />
                          <span className="font-semibold">{review.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Difficulty: {review.difficulty}/5
                        </span>
                        {review.would_take_again && (
                          <span className="text-sm text-green-600 font-medium">Would take again</span>
                        )}
                        {review.grade_received && (
                          <span className="text-sm text-gray-600">Grade: {review.grade_received}</span>
                        )}
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {review.for_credit && <span>For credit</span>}
                        {review.attendance_mandatory && <span>Attendance mandatory</span>}
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
