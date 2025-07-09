import React from 'react';
import { useRole } from '../../contexts/RoleContext';
import { User } from '../../types';
import NotAuthorized from '../common/NotAuthorized';

interface RoleBasedGuardProps {
  children: React.ReactNode;
  allowedRoles: User['role'][];
  fallback?: React.ReactNode;
}

const RoleBasedGuard: React.FC<RoleBasedGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback 
}) => {
  const { hasRole } = useRole();

  if (!hasRole(allowedRoles)) {
    return fallback || <NotAuthorized />;
  }

  return <>{children}</>;
};

export default RoleBasedGuard;