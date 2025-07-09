import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { RoleProvider } from './contexts/RoleContext';
import LoginForm from './components/auth/LoginForm';
import PrivateRoute from './components/auth/PrivateRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

function App() {
  const { user, isAuthenticated, loading, login, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

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
              activeItem={activeSection}
              onItemClick={setActiveSection}
            />
            
            <main className="flex-1 min-h-screen">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <PrivateRoute>
                      <Dashboard user={user!} activeSection={activeSection} />
                    </PrivateRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </RoleProvider>
  );
}

export default App;