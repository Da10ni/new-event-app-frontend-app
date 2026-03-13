import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface RoleRouteProps { allowedRoles: string[]; redirectTo?: string; }

export const RoleRoute = ({ allowedRoles, redirectTo = '/' }: RoleRouteProps) => {
  const { role } = useAppSelector((state) => state.auth);
  if (!role || !allowedRoles.includes(role)) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
};
