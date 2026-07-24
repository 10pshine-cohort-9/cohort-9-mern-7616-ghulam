import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, CircleAlert } from 'lucide-react';
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
    <AuthLayout
      title="Create your account"
      subtitle="Start capturing your ideas with Aether Notes."
    >
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 bg-error-container/60 border border-error/20 text-on-error-container rounded-xl px-4 py-2.5 text-xs mb-3 animate-slide-up">
          <CircleAlert className="w-4 h-4 text-error flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-3.5" onSubmit={handleSubmit}>
        {/* Name Field */}
        <div className="space-y-1">
          <label className="text-label-sm text-on-surface ml-1 block" htmlFor="signup-name">
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            required
            autoComplete="name"
            className="aether-input"
          />
        </div>

        {/* Email Field */}
        <div className="space-y-1">
          <label className="text-label-sm text-on-surface ml-1 block" htmlFor="signup-email">
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            autoComplete="email"
            className="aether-input"
          />
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-label-sm text-on-surface ml-1 block" htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 chars"
              required
              autoComplete="new-password"
              className="aether-input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-label-sm text-on-surface ml-1 block" htmlFor="signup-confirm">
              Confirm
            </label>
            <input
              id="signup-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter"
              required
              autoComplete="new-password"
              className="aether-input"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary mt-2 flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      {/* Link to Login */}
      <p className="text-center text-sm text-on-surface-variant mt-4">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-primary font-bold hover:underline transition-all"
        >
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignupPage;
