import React, { useState, useEffect } from 'react';
import apiClient from '../../services/axiosInterceptor';
import CreateSalesOrder from './CreateSalesOrder';

interface SalesOrder {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt: string | null;
  isPaid: boolean;
  paidAt: string | null;
  salesRep: {
    name: string;
  };
  approvedBy: {
    name: string;
  } | null;
  items: Array<{
    quantity: number;
    product: {
      name: string;
    };
    totalPrice: string;
  }>;
}

export const PendingSalesOrder: React.FC = () => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending'>('pending');

  useEffect(() => {
    const fetchAllSalesOrder = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/sales');
        setSalesOrders(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch sales orders. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSalesOrder();
  }, []);

  useEffect(() => {
    if (statusFilter === 'pending') {
      setFilteredOrders(salesOrders.filter(order => order.status === 'pending'));
    } else {
      setFilteredOrders(salesOrders);
    }
  }, [statusFilter, salesOrders]);

  const handleApprove = async (orderId: number) => {
    try {
      await apiClient.put(`/api/sales/${orderId}/approve`);
      setSalesOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: 'approved' } : order
        )
      );
    } catch (err) {
      console.error('Failed to approve order:', err);
      alert('Failed to approve order. Please try again.');
    }
  };

  const handleReject = async (orderId: number) => {
    try {
      await apiClient.put(`/api/sales/${orderId}/reject`);
      setSalesOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: 'rejected' } : order
        )
      );
    } catch (err) {
      console.error('Failed to reject order:', err);
      alert('Failed to reject order. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  const calculateOrderTotal = (items: SalesOrder['items']) => {
    return items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales Orders</h1>
        
        <div className="flex items-center space-x-4">
          <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      </div>
      <div className="mb-6">
        <CreateSalesOrder />
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Rep
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.salesRep.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <ul className="list-disc pl-5">
                        {order.items.slice(0, 2).map((item, index) => (
                          <li key={index}>
                            {item.product.name} (x{item.quantity})
                          </li>
                        ))}
                        {order.items.length > 2 && (
                          <li className="text-gray-400">+{order.items.length - 2} more</li>
                        )}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(calculateOrderTotal(order.items).toString())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(order.id)}
                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(order.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {order.status !== 'pending' && (
                        <span className="text-gray-400">Approved by {order.approvedBy?.name}</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders found{statusFilter === 'pending' ? ' with pending status' : ''}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};