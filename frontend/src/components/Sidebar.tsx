import React from 'react';
import { 
  Home, 
  Users, 
  BarChart3, 
  DollarSign, 
  FileText, 
  Settings, 
  TrendingUp,
  UserCheck,
  Receipt,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SidebarItem, User } from '../types';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  user: User;
  isCollapsed: boolean;
  onToggle: () => void;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'Home',
    path: '/',
    roles: ['admin', 'manager', 'sales', 'accountant']
  },
  {
    id: 'users',
    label: 'Users',
    icon: 'Users',
    path: '/users',
    roles: ['admin']
  },
  {
    id: 'inventory',
    label: 'inventory',
    icon: 'Home',
    path: '/inventory',
    roles: ['admin']
  }, 
  {
    id: 'sales',
    label: 'Sales',
    icon: 'TrendingUp',
    path: '/sales',
    roles: ['admin', 'manager', 'sales']
  },
  {
    id: 'Pendingpayments',
    label: 'Pending Payments',
    icon: 'DollarSign',
    path: '/Pending-payments',
    roles: ['accountant']
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'FileText',
    path: '/reports',
    roles: ['admin', 'accountant']
  },
  {
    id: 'invoices',
    label: 'Invoices',
    icon: 'Receipt',
    path: '/invoices',
    roles: ['admin', 'manager', 'accountant']
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    path: '/settings',
    roles: ['admin', 'manager', 'sales', 'accountant']
  }
];

const iconMap = {
  Home,
  Users,
  BarChart3,
  DollarSign,
  FileText,
  Settings,
  TrendingUp,
  UserCheck,
  Receipt
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  user, 
  isCollapsed, 
  onToggle 
}) => {
  const location = useLocation();
  const filteredItems = sidebarItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
     <div className={`
      bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-16' : 'w-64'}
      h-screen sticky top-0 flex flex-col shadow-lg
    `}>
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">D</span>
            </div>
            <span className="text-lg font-semibold text-gray-800">Dashboard</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 hidden lg:block"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-1 px-2">
          {filteredItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.replace('-', ' ')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
