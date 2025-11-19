import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import FXUnlockedLogo from '@/components/FXUnlockedLogo';

const Login: React.FC = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('lastEmail') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(() => localStorage.getItem('lastError') || '');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('lastEmail', email);
  }, [email]);

  useEffect(() => {
    localStorage.setItem('lastError', error);
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Clear previous error

    try {
      await login(email, password);
      localStorage.removeItem('lastError'); // Clear error on success
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
      console.error('Login error:', errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <FXUnlockedLogo size="lg" />
          </div>
          <CardDescription>Sign in to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@fxunlock.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className={error ? 'border-red-300' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className={error ? 'border-red-300' : ''}
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-center mt-4">
              <a href="#" onClick={(e) => {
                e.preventDefault();
                alert('Please contact your administrator to reset your password.');
              }} className="text-sm text-blue-600 hover:text-blue-800 underline">
                Forgot password?
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
