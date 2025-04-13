
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlowState } from '@/context/FlowStateContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser } = useFlowState();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(email, password);
    navigate('/');
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
            <CardTitle className="text-2xl font-bold text-flowstate-purple">FlowState AI</CardTitle>
            <CardDescription>Log in to track your focus progress</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
                  placeholder="Your password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <p className="text-xs text-muted-foreground">
                For demo purposes, you can use any email and password.
              </p>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-flowstate-purple hover:bg-flowstate-purple/90 text-white"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Log In
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
