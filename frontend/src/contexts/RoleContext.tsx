import React, { createContext, useContext, ReactNode } from 'react';
import { User } from '../types';

interface RoleContextType {
  user: User | null;
  hasRole: (roles: User['role'][]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
  user: User | null;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children, user }) => {
  const hasRole = (roles: User['role'][]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const permissions: Record<User['role'], string[]> = {
      admin: ['all'],
      manager: ['view_sales', 'manage_orders', 'view_reports', 'manage_users'],
      sales: ['view_sales', 'create_orders', 'view_own_data'],
      accountant: ['view_finance', 'manage_transactions', 'view_reports']
    };

    return permissions[user.role]?.includes(permission) || permissions[user.role]?.includes('all') || false;
  };

  return (
    <RoleContext.Provider value={{ user, hasRole, hasPermission }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};