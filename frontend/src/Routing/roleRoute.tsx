import { Navigate, useLocation } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleRoute = ({ children, allowedRoles }: Props) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();
 
  // مش مسجل دخول
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // معندوش صلاحية
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;