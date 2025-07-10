import { Routes, Route, Outlet } from 'react-router-dom';
import { useRole } from '../contexts/RoleContext';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { ManagerDashboard } from './dashboards/ManagerDashboard';
import { SalesRepDashboard } from './dashboards/SalesRepDashboard';
import { AccountantDashboard } from './dashboards/AccountantDashboard';
import { PendingPayment } from './ReportComponents/PendingPayment';
import { ProductRevenueTable } from './ReportComponents/ProductRevenueTable';
import { Invoices } from './ReportComponents/Invoices';
import { SalesOrder } from './salesComponents/SalesOrder';
import { PendingSalesOrder } from './salesComponents/PendingSalesOrder';
import { UserDetails } from './userComponents/UserDetails';
import { ProductList } from './productComponents/ProductList';
import { Settings } from './Settings';

export const Dashboard = () => {
  const { user } = useRole();

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={
          user?.role === 'admin' ? <AdminDashboard /> :
          user?.role === 'manager' ? <ManagerDashboard /> :
          user?.role === 'sales' ? <SalesRepDashboard /> :
          user?.role === 'accountant' ? <AccountantDashboard /> :
          <DefaultDashboardView />
        } />
        
        <Route path="pending-payments" element={<PendingPayment />} />
        <Route path="reports" element={<ProductRevenueTable />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="inventory" element={<ProductList />} />
        <Route path="settings" element={<Settings />} />
        
        {/* Role-protected sections */}
        <Route path="users" element={
          (user?.role === 'admin' || user?.role === 'manager') 
            ? <UserDetails /> 
            : <UnauthorizedView />
        } />
        
        <Route path="sales" element={
          (user?.role === 'admin' || user?.role === 'manager')
            ? <PendingSalesOrder />
            : <SalesOrder />
        } />
        
        {/* Fallback route */}
        <Route path="*" element={<NotFoundView />} />
      </Route>
    </Routes>
  );
};

const DashboardLayout = () => {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <Outlet /> 
      </div>
    </div>
  );
};

const DefaultDashboardView = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h3 className="text-lg font-medium text-gray-800 mb-2">Welcome to Dashboard</h3>
      <p className="text-gray-600">Please select a valid user role.</p>
    </div>
  </div>
);

const UnauthorizedView = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h3 className="text-lg font-medium text-gray-800 mb-2">Unauthorized Access</h3>
      <p className="text-gray-600">You don't have permission to view this section.</p>
    </div>
  </div>
);

const NotFoundView = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h3 className="text-lg font-medium text-gray-800 mb-2">Section Not Found</h3>
      <p className="text-gray-600">The requested section is not available.</p>
    </div>
  </div>
);