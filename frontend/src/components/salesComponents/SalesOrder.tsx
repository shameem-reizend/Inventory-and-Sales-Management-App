import React, { useEffect, useState } from 'react';
import apiClient from '../../services/axiosInterceptor';
import CreateSalesOrder from './CreateSalesOrder';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitPrice: string;
  stock: number;
}

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product: Product;
}

interface SalesOrder {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt: string;
  isPaid: boolean;
  paidAt: string | null;
  salesRep: User;
  approvedBy: User;
  items: OrderItem[];
}

export const SalesOrder: React.FC = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get current user
        const userResponse = await apiClient.get('/api/auth/me');
        setCurrentUser(userResponse.data);
        
        // Then get all sales
        const salesResponse = await apiClient.get('/api/sales');
        
        // Filter sales for current user only
        const userOrders = salesResponse.data.filter(
          (order: SalesOrder) => order.salesRep.id === userResponse.data.id
        );
        
        setOrders(userOrders);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orders]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 text-red-700 rounded-lg">
      {error}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Sales Dashboard</h1>
        {currentUser && (
          <p className="mt-2 text-lg text-gray-600">
            Welcome back, <span className="font-semibold text-blue-600">{currentUser.name}</span>
          </p>
        )}
      </div>
        <div className="my-5">
          <CreateSalesOrder />
        </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Your Sales Orders ({orders.length})
          </h3>
        </div>

        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            You don't have any sales orders yet
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h4 className="text-lg font-semibold text-gray-800">
                        Order #{order.id}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                      {order.isPaid && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          PAID
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <p className="font-medium text-gray-900">Created</p>
                        <p>{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Status</p>
                        <p>
                          {order.approvedBy?.name 
                            ? `${formatDate(order.approvedAt)} by ${order.approvedBy.name}`
                            : 'Pending'}
                        </p>
                      </div>
                      {order.paidAt && (
                        <div>
                          <p className="font-medium text-gray-900">Paid At</p>
                          <p>{formatDate(order.paidAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg min-w-[200px]">
                    <p className="text-sm font-medium text-gray-900 mb-1">Order Summary</p>
                    <p className="text-sm text-gray-600">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-lg font-semibold mt-2">
                      ₹{order.items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {order.items.length > 0 && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Items</h5>
                    <ul className="space-y-3">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between items-start">
                          <div className="flex items-start space-x-4">
                            <div className="bg-gray-100 rounded-md p-2">
                              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                              <p className="text-xs text-gray-500">{item.product.sku}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              ₹{parseFloat(item.totalPrice).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.quantity} × ₹{parseFloat(item.unitPrice).toFixed(2)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};