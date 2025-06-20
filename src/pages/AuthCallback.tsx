import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import API_URL from '@/config/api';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const completeAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          credentials: 'include',
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          localStorage.setItem('user', JSON.stringify(data.data));
        }
      } catch (error) {
        console.error('Auth callback error:', error);
      } finally {
        navigate('/');
      }
    };

    completeAuth();
  }, [navigate]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Please wait while we log you in...</p>
    </div>
  );
};

export default AuthCallback; 