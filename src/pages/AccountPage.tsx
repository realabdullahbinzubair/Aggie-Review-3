import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar } from 'lucide-react';
import NavBar from '../components/NavBar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

export default function AccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadProfile();
    loadReviewCount();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const loadReviewCount = async () => {
    if (!user) return;

    const { count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    setReviewCount(count || 0);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">My Account</h2>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-yellow-100 rounded-full p-4">
              <User size={32} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {profile?.full_name || 'User'}
              </h3>
              <p className="text-gray-600">NC A&T Student</p>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <Mail size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900 font-medium">{profile?.email || user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-gray-900 font-medium">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews Written</h3>
            <p className="text-4xl font-bold text-yellow-600 mb-2">{reviewCount}</p>
            <button
              onClick={() => navigate('/my-reviews')}
              className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
            >
              View all reviews →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                Search Professors
              </button>
              <button
                onClick={() => navigate('/change-password')}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
