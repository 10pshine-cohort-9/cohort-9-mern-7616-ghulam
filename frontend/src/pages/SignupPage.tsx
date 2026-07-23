import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

import AuthLayout from '../components/AuthLayout.tsx';
import { useAuth } from '../context/AuthContext.tsx';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-center mb-2">
          <h2 className="text-xl font-semibold text-text-primary">Create an account</h2>
          <p className="text-sm text-text-muted mt-1">Start organizing your notes</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 bg-error/10 border border-error/20 text-error rounded-xl px-4 py-3 text-sm animate-slide-in-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Name Field */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-text-secondary">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-3 rounded-xl
                         bg-surface-900/50 border border-surface-600
                         text-text-primary placeholder:text-text-muted
                         focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50
                         transition-all duration-200"
              autoComplete="name"
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-text-secondary">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl
                         bg-surface-900/50 border border-surface-600
                         text-text-primary placeholder:text-text-muted
                         focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50
                         transition-all duration-200"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-text-secondary">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full pl-10 pr-4 py-3 rounded-xl
                         bg-surface-900/50 border border-surface-600
                         text-text-primary placeholder:text-text-muted
                         focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50
                         transition-all duration-200"
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-text-secondary">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full pl-10 pr-4 py-3 rounded-xl
                         bg-surface-900/50 border border-surface-600
                         text-text-primary placeholder:text-text-muted
                         focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50
                         transition-all duration-200"
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2
                     bg-primary-500 hover:bg-primary-600 active:bg-primary-700
                     text-white font-medium px-6 py-3 rounded-xl
                     transition-all duration-200 ease-out
                     hover:shadow-lg hover:shadow-primary-500/25
                     focus:outline-none focus:ring-2 focus:ring-primary-500/50
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <UserPlus className="w-5 h-5" />
          )}
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>

        {/* Link to Login */}
        <p className="text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary-400 hover:text-primary-500 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;
