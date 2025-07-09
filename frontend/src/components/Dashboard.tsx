import { User } from '../types';
import {AdminDashboard} from './dashboards/AdminDashboard';
import {ManagerDashboard} from './dashboards/ManagerDashboard';
import {SalesRepDashboard} from './dashboards/SalesRepDashboard';
import {AccountantDashboard} from './dashboards/AccountantDashboard';
import { PendingPayment } from './ReportComponents/PendingPayment';
import { ProductRevenueTable } from './ReportComponents/ProductRevenueTable';
import { Invoices } from './ReportComponents/Invoices';
import { SalesOrder } from './salesComponents/SalesOrder';
import { PendingSalesOrder } from './salesComponents/PendingSalesOrder';
import { UserDetails } from './userComponents/UserDetails';
import { ProductList } from './productComponents/ProductList';
import { Settings } from './Settings';

interface DashboardProps {
  user: User;
  activeSection: string;
}

const Dashboard: React.FC<DashboardProps> = ({ user, activeSection }) => {

  const renderDashboard = () => {

    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'sales':
        return <SalesRepDashboard />;
      case 'accountant':
        return <AccountantDashboard />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Welcome to Dashboard</h3>
              <p className="text-gray-600">Please select a valid user role.</p>
            </div>
          </div>
        );
    }
  };

  const renderSidebar = () => {

    switch(activeSection){
      case'Pendingpayments':
        return(
        <PendingPayment />
      )

      case 'reports':
        return <ProductRevenueTable />

      case 'invoices':
        return <Invoices />

      case 'users':
        return <UserDetails />

      case 'inventory':
        return <ProductList />
      
      case 'settings':
        return <Settings />

      case 'sales':
        if(user.role === 'manager' || user.role === 'admin'){
          return <PendingSalesOrder />
        }
        return <SalesOrder />
      default: 
           return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Section
            </h3>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        {activeSection === 'dashboard' ? renderDashboard() : renderSidebar()}
      </div>
    </div>
  );
};

export default Dashboard;