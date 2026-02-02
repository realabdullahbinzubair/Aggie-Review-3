import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function SignInUpPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const validateEmail = (email: string) => {
    return email.toLowerCase().endsWith('@aggies.ncat.edu');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('You must use a valid NC A&T email (@aggies.ncat.edu)');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (isSignUp && !fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message);
        } else {
          // Show verification message instead of navigating
          setShowVerificationMessage(true);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setError('Please verify your email before signing in. Check your inbox for the verification link.');
          } else {
            setError('Invalid email or password');
          }
        } else {
          navigate('/');
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'email',
      });

      if (error) {
        setError(error.message || 'Invalid verification code');
      } else if (data.session) {
        // Successfully verified and signed in
        navigate('/');
      }
    } catch {
      setError('Failed to verify code');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ncat-gold-light/10 to-ncat-gold-light/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <GraduationCap size={48} className="text-ncat-blue" />
            <h1 className="text-4xl font-bold text-gray-900">Aggie Review</h1>
          </div>
          <p className="text-gray-600">North Carolina A&T State University</p>
        </div>

        {showVerificationMessage ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="mb-4 flex justify-center">
                <Mail size={64} className="text-ncat-gold" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Verify Your Email</h2>
              <p className="text-gray-600 mb-2">
                We've sent a verification code to:
              </p>
              <p className="text-ncat-blue font-semibold mb-6">{email}</p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ncat-gold focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || verificationCode.length !== 6}
                className="w-full bg-ncat-gold hover:bg-ncat-blue text-white font-semibold py-3 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowVerificationMessage(false);
                  setIsSignUp(false);
                  setEmail('');
                  setPassword('');
                  setFullName('');
                  setVerificationCode('');
                  setError('');
                }}
                className="text-sm text-gray-600 hover:text-ncat-blue transition-colors"
              >
                Back to Sign In
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Didn't receive the code? Check your spam folder or try signing up again.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-2 rounded-md font-medium transition-all ${
                !isSignUp
                  ? 'bg-ncat-gold text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-2 rounded-md font-medium transition-all ${
                isSignUp
                  ? 'bg-ncat-gold text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ncat-gold focus:border-transparent"
                    placeholder="John Doe"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                NC A&T Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ncat-gold focus:border-transparent"
                  placeholder="student@aggies.ncat.edu"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must end with @aggies.ncat.edu
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ncat-gold focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                At least 6 characters
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ncat-gold hover:bg-ncat-blue text-white font-semibold py-3 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-gray-600 hover:text-ncat-blue transition-colors"
            >
              Continue as guest
            </button>
          </div>
        </div>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          By signing up, you agree to rate professors fairly and honestly
        </p>
      </div>
    </div>
  );
}
