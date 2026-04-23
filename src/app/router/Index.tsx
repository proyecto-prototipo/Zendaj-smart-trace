import { Navigate } from 'react-router-dom';
import { useAuth, rolePaths } from '@/app/auth/useAuth';

const Index = () => {
  const session = useAuth(s => s.session);
  return <Navigate to={session ? rolePaths[session.role] : '/login'} replace />;
};

export default Index;
