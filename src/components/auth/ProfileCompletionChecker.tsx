
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const ProfileCompletionChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user) {
      const profileComplete = !!user.user_metadata?.user_type;
      if (!profileComplete && location.pathname !== '/register' && location.pathname !== '/login') {
        navigate('/register');
      }
    }
  }, [user, loading, navigate, location.pathname]);

  return <>{children}</>;
};

export default ProfileCompletionChecker;
