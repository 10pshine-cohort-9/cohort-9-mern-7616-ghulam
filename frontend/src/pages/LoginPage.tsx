import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, CircleAlert } from 'lucide-react';
import axios from 'axios';

import AuthLayout from '../components/AuthLayout.tsx';
import { useAuth } from '../context/AuthContext.tsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
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
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your notes."
    >
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 bg-error-container/60 border border-error/20 text-on-error-container rounded-xl px-4 py-2.5 text-xs mb-4 animate-slide-up">
          <CircleAlert className="w-4 h-4 text-error flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="space-y-1">
          <label className="text-label-sm text-on-surface ml-1 block" htmlFor="login-email">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            autoComplete="email"
            className="aether-input"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label className="text-label-sm text-on-surface ml-1 block" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="aether-input"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary mt-2 flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {isSubmitting ? 'Signing in...' : 'Continue'}
        </button>
      </form>

      {/* Link to Signup */}
      <p className="text-center text-sm text-on-surface-variant mt-5">
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          className="text-primary font-bold hover:underline transition-all"
        >
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
