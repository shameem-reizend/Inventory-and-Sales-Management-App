import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { RoleProvider } from './contexts/RoleContext';
import LoginForm from './components/auth/LoginForm';
import Navbar from './components/Navbar';
import {Sidebar} from './components/Sidebar';
// import Dashboard from './components/Dashboard';
import { Toaster } from 'react-hot-toast';
import { Dashboard } from './components/Dashboard';
import { UserProvider } from './contexts/UserContext';

export const App: React.FC = () => {
  const { user, isAuthenticated, loading, login, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} loading={loading} />;
  }

  return (
    <RoleProvider user={user}>
      <UserProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar 
              user={user!} 
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
              onLogout={logout}
            />
            
            <div className="flex">
              <Sidebar
                user={user!}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              
              <Dashboard />
            </div>
            <Toaster
              position="bottom-right"
              reverseOrder={false}
              />
          </div>
        </Router>
      </UserProvider>
    </RoleProvider>
  );
}