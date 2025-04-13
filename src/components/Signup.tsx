import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFlowState } from '@/context/FlowStateContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { registerUser } = useFlowState();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await registerUser(email, password, name);
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to register');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-flowstate-background">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="relative flex items-center justify-center w-24 h-24 mb-2">
            <Brain className="w-16 h-16 text-flowstate-purple animate-pulse-light" />
            <div className="absolute inset-0 bg-flowstate-purple/10 rounded-full animate-pulse-light" />
          </div>
        </div>
        
        <Card className="w-full bg-white shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-flowstate-purple">Create Account</CardTitle>
            <CardDescription>Sign up to start tracking your focus progress</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Your name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Create a password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Confirm your password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-flowstate-purple hover:bg-flowstate-purple/90 text-white"
                disabled={isLoading}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
              <div className="text-sm text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-flowstate-purple hover:underline">
                  Log in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
