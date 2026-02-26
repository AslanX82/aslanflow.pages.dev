
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Clock } from 'lucide-react';
import { Helmet } from 'react-helmet';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      await signup(email, password, passwordConfirm);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - Work Log</title>
      </Helmet>
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Clock className="w-12 h-12 text-[#5B7FFF]" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-[#1a1a1a] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-800">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <Label htmlFor="email" className="text-gray-300">Email address</Label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#2a2a2a] border-gray-700 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="mt-1">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#2a2a2a] border-gray-700 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="passwordConfirm" className="text-gray-300">Confirm Password</Label>
                <div className="mt-1">
                  <Input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type="password"
                    required
                    minLength={8}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="bg-[#2a2a2a] border-gray-700 text-white"
                  />
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full bg-[#5B7FFF] hover:bg-[#4a6eee] text-white" disabled={loading}>
                  {loading ? 'Creating account...' : 'Sign up'}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-[#5B7FFF] hover:text-[#4a6eee]">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
