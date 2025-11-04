import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, BookOpen, Users } from 'lucide-react';
import NavBar from '../components/NavBar';
import { supabase } from '../lib/supabase';
import { Course, Professor, Review } from '../types';

interface ProfessorWithReviews extends Professor {
  reviews: Review[];
}

export default function CourseSearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse] = useState<Course | null>(null);
  const [professorData, setProfessorData] = useState<ProfessorWithReviews[]>([]);
  const [loading, setLoading] = useState(true);

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    searchCourses();
  }, [searchQuery]);

  useEffect(() => {
    if (selectedCourse) {
      loadCourseProfessors(selectedCourse.id);
    }
  }, [selectedCourse]);

  const searchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*, department:departments(*)')
      .or(`code.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
      .order('code');

    if (!error && data) {
      setCourses(data);
      if (data.length === 1) {
        navigate(`/course-profile?code=${encodeURIComponent(data[0].code)}`);
      }
    }
    setLoading(false);
  };

  const loadCourseProfessors = async (courseId: string) => {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*, professor:professors(*, department:departments(*))')
      .eq('course_id', courseId);

    if (!error && reviews) {
      const professorMap = new Map<string, ProfessorWithReviews>();

      reviews.forEach((review) => {
        if (review.professor) {
          const profId = review.professor.id;
          if (!professorMap.has(profId)) {
            professorMap.set(profId, {
              ...review.professor,
              reviews: [],
            });
          }
          professorMap.get(profId)!.reviews.push(review);
        }
      });

      setProfessorData(Array.from(professorMap.values()));
    }
  };

  const handleProfessorClick = (professor: Professor) => {
    navigate(`/professor?search=${encodeURIComponent(professor.name)}`);
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

  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-start space-x-4">
              <div className="bg-ncat-gold-light/20 rounded-full p-4">
                <BookOpen size={32} className="text-ncat-blue" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedCourse.code}</h2>
                <p className="text-xl text-gray-600 mb-2">{selectedCourse.name}</p>
                <p className="text-gray-500">{selectedCourse.department?.name}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Professors Teaching This Course
            </h3>
            {professorData.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">No reviews found for this course yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {professorData.map((professor) => (
                  <div
                    key={professor.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-ncat-gold cursor-pointer"
                    onClick={() => handleProfessorClick(professor)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-1">
                          {professor.name}
                        </h4>
                        <p className="text-gray-600">{professor.title}</p>
                        <p className="text-sm text-gray-500">{professor.department?.name}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-ncat-blue">
                          {professor.average_rating.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center text-ncat-gold">
                          <Star size={16} fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Users size={20} className="text-gray-600" />
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {professor.total_reviews}
                        </div>
                        <div className="text-xs text-gray-500">Total Reviews</div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {professor.would_take_again_percent}%
                        </div>
                        <div className="text-xs text-gray-500">Would Take Again</div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {professor.difficulty_rating.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Difficulty</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold">{professor.reviews.length}</span>{' '}
                        {professor.reviews.length === 1 ? 'review' : 'reviews'} for this course
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
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

        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No courses found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => navigate(`/course-profile?code=${encodeURIComponent(course.code)}`)}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 text-left border border-gray-100 hover:border-ncat-gold"
              >
                <div className="flex items-start space-x-3 mb-3">
                  <BookOpen size={24} className="text-ncat-blue mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{course.code}</h3>
                    <p className="text-sm text-gray-600">{course.name}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{course.department?.name}</p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
