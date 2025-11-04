import { GraduationCap, Menu, User, Lock, LogOut, FileText } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NavBar() {
  const [showMenu, setShowMenu] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setShowMenu(false);
    navigate('/');
  };

  return (
    <nav className="bg-ncat-blue text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
          >
            <GraduationCap size={32} />
            <div className="text-left">
             <h1 className="text-xl font-bold text-ncat-gold">Aggie Review</h1>
              <p className="text-xs text-white">NC A&T</p>
            </div>
          </button>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center space-x-2 bg-ncat-blue hover:bg-ncat-blue-dark px-4 py-2 rounded-lg transition-colors"
                >
                  <Menu size={20} />
                  <span className="hidden sm:inline">Menu</span>
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 py-2">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.email}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setShowMenu(false);
                          navigate('/account');
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <User size={18} />
                        <span>My Account</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowMenu(false);
                          navigate('/my-reviews');
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <FileText size={18} />
                        <span>My Reviews</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowMenu(false);
                          navigate('/change-password');
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Lock size={18} />
                        <span>Change Password</span>
                      </button>

                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleSignOut}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <LogOut size={18} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="bg-white text-ncat-blue hover:bg-ncat-gold-light/10 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
