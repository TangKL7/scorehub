'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Header from '@/components/layout/header';
import { UserRole } from '@/types/database.types';

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    nationality: '',
    role: 'player' as UserRole,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        phone: formData.phone,
        nationality: formData.nationality,
        role: formData.role,
      };

      await signUp(formData.email, formData.password, userData);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <Header />
      
      <main className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Register to access ScoreHub's tournament management features
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1234567890"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="nationality" className="text-sm font-medium">
                  Nationality (Optional)
                </label>
                <Input
                  id="nationality"
                  name="nationality"
                  type="text"
                  placeholder="e.g. Spanish"
                  value={formData.nationality}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  I am a:
                </label>
                <select
                  id="role"
                  name="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="player">Player</option>
                  <option value="organizer">Club Organizer</option>
                  <option value="spectator">Spectator</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Register'}
              </Button>
              
              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link href="/signin" className="text-primary hover:underline">
                  Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
} 