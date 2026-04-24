import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/permissions';

function RequirePermission({ permission, children }) {
  const { user } = useAuth();

  if (!hasPermission(user, permission)) {
    return <Navigate to="/sem-acesso" replace />;
  }

  return children;
}

export default RequirePermission;
