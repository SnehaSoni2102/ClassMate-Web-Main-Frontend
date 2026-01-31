
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <div className="h-16 w-16 mx-auto rounded-full border-4 border-t-blue-600 border-blue-200 animate-spin"></div>
        <h1 className="text-2xl font-bold text-blue-700 mt-4">EdTech Admin</h1>
        <p className="text-gray-600">Loading application...</p>
      </div>
    </div>
  );
};

export default Index;
