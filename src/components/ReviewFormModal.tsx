import { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { Professor, NewReview, Course } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ReviewFormModalProps {
  professor: Professor;
  onClose: () => void;
  onSubmit: () => void;
}

export default function ReviewFormModal({ professor, onClose, onSubmit }: ReviewFormModalProps) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<NewReview>({
    professor_id: professor.id,
    course_id: '',
    rating: 0,
    difficulty: 0,
    would_take_again: true,
    for_credit: true,
    attendance_mandatory: false,
    grade_received: '',
    comment: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hoveredDifficulty, setHoveredDifficulty] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const { data: professorDepts } = await supabase
      .from('professor_departments')
      .select('department_id')
      .eq('professor_id', professor.id);

    if (!professorDepts || professorDepts.length === 0) {
      setCourses([]);
      return;
    }

    const departmentIds = professorDepts.map(pd => pd.department_id);

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .in('department_id', departmentIds)
      .order('code');

    if (!error && data) {
      setCourses(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be signed in to submit a review');
      return;
    }

    if (formData.rating === 0 || formData.difficulty === 0 || !formData.course_id || formData.comment.length < 20) {
      setError('Please fill in all required fields. Comment must be at least 20 characters.');
      return;
    }

    setSubmitting(true);

    const { error: reviewError } = await supabase
      .from('reviews')
      .insert({
        ...formData,
        user_id: user.id,
      });

    if (reviewError) {
      if (reviewError.code === '23505') {
        setError('You have already reviewed this professor for this course');
      } else {
        setError('Failed to submit review. Please try again.');
      }
      setSubmitting(false);
      return;
    }

    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('professor_id', professor.id);

    if (reviews) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      const avgDifficulty = reviews.reduce((sum, r) => sum + r.difficulty, 0) / reviews.length;
      const wouldTakeAgainCount = reviews.filter(r => r.would_take_again).length;
      const wouldTakeAgainPercent = (wouldTakeAgainCount / reviews.length) * 100;

      await supabase
        .from('professors')
        .update({
          average_rating: Math.round(avgRating * 10) / 10,
          difficulty_rating: Math.round(avgDifficulty * 10) / 10,
          would_take_again_percent: Math.round(wouldTakeAgainPercent),
          total_reviews: reviews.length,
        })
        .eq('id', professor.id);
    }

    setSubmitting(false);
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Rate {professor.name}</h2>
            <p className="text-gray-600">{professor.department?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Course <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ncat-gold focus:border-transparent"
              required
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={36}
                    className={
                      star <= (hoveredRating || formData.rating)
                        ? 'text-ncat-gold'
                        : 'text-gray-300'
                    }
                    fill={star <= (hoveredRating || formData.rating) ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
              <span className="ml-2 text-lg font-semibold text-gray-700">
                {formData.rating > 0 ? formData.rating : 'Select rating'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Level of Difficulty <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: level })}
                  onMouseEnter={() => setHoveredDifficulty(level)}
                  onMouseLeave={() => setHoveredDifficulty(0)}
                  className={`w-12 h-12 rounded-lg font-bold text-white transition-all ${
                    level <= (hoveredDifficulty || formData.difficulty)
                      ? 'bg-ncat-gold scale-110'
                      : 'bg-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">(1=Easy, 5=Hard)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Would you take this professor again? <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, would_take_again: true })}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  formData.would_take_again
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, would_take_again: false })}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  !formData.would_take_again
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                No
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Grade Received (Optional)
            </label>
            <select
              value={formData.grade_received}
              onChange={(e) => setFormData({ ...formData, grade_received: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ncat-gold focus:border-transparent"
            >
              <option value="">Select grade</option>
              <option value="A">A</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B">B</option>
              <option value="B-">B-</option>
              <option value="C+">C+</option>
              <option value="C">C</option>
              <option value="C-">C-</option>
              <option value="D">D</option>
              <option value="F">F</option>
              <option value="Audit">Audit/No Grade</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.for_credit}
                onChange={(e) => setFormData({ ...formData, for_credit: e.target.checked })}
                className="w-5 h-5 text-ncat-gold border-gray-300 rounded focus:ring-ncat-gold"
              />
              <span className="text-sm text-gray-700">Taken for credit</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.attendance_mandatory}
                onChange={(e) => setFormData({ ...formData, attendance_mandatory: e.target.checked })}
                className="w-5 h-5 text-ncat-gold border-gray-300 rounded focus:ring-ncat-gold"
              />
              <span className="text-sm text-gray-700">Attendance is mandatory</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Share your experience with this professor..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ncat-gold focus:border-transparent resize-none"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Minimum 20 characters ({formData.comment.length}/20)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-ncat-gold hover:bg-ncat-blue text-white rounded-lg font-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
