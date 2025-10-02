import React from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';

interface ParamRedirectProps {
  toBase: string;
  replace?: boolean;
}

const ParamRedirect: React.FC<ParamRedirectProps> = ({ toBase, replace = true }) => {
  const params = useParams();
  const location = useLocation();
  const paramPath = Object.values(params).filter(Boolean).join('/');
  const to = paramPath ? `${toBase}/${paramPath}` : toBase;
  console.log("🔀 ParamRedirect:", {
    from: location.pathname,
    params,
    computedTo: to
  });
  return <Navigate to={to} replace={replace} />;
};

export default ParamRedirect;
