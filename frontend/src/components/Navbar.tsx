import React from 'react';
import { Search, Settings, User, Menu, LogOut } from 'lucide-react';
import { User as UserType } from '../types';
import { NotificationBell } from './notificationComponent/NotificationBell';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router';

interface NavbarProps {
  user: UserType;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onToggleSidebar, onLogout }) => {

  const {name} = useUser();
  const Navigate = useNavigate();

  const handleSettings = () => {
    Navigate('settings');
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 lg:hidden"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div className="flex items-center space-x-2">
            <NotificationBell />
          
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200" onClick={handleSettings}>
            <Settings className="w-5 h-5 text-gray-600" />
          </button>

          <button 
            onClick={onLogout}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800">{name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;