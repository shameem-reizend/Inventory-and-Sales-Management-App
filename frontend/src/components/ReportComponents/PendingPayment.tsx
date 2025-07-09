import React, { useEffect, useState } from 'react';
import { FaClock, FaUser, FaMoneyBillWave, FaCheckCircle, FaShoppingCart } from 'react-icons/fa';
import apiClient from '../../services/axiosInterceptor';
import { format } from 'date-fns';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ProductItem {
  id: number;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product: {
    id: number;
    name: string;
    sku: string;
    category: string;
  };
}

interface PendingTransaction {
  id: number;
  status: string;
  createdAt: string;
  approvedAt: string;
  isPaid: boolean;
  paidAt: string | null;
  salesRep: User;
  items: ProductItem[];
}

const formatCurrency = (value: string | number) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue);
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
};

export const PendingPayment: React.FC = () => {
  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('api/reports/pending');
      setTransactions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch pending payments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const calculateTotal = (items: ProductItem[]) => {
    return items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
  };

  const markAsPaid = async (transactionId: number) => {
    try {
      await apiClient.put(`api/sales/${transactionId}/pay`);
      fetchPendingPayments(); // Refresh the list after marking as paid
    } catch (err) {
      console.error('Error marking transaction as paid:', err);
    }
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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
        <button 
          onClick={fetchPendingPayments}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaClock className="mr-2 text-yellow-500" /> Pending Payments
          </h2>
          <p className="text-sm text-gray-500">Approved transactions awaiting payment</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <FaShoppingCart className="mr-1" /> {transactions.length} Pending
        </span>
      </div>

      {transactions.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <h3 className="font-medium text-gray-900">Transaction #{transaction.id}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FaCheckCircle className="mr-1" /> Approved
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <div className="flex items-center text-gray-500">
                      <FaUser className="mr-1 text-blue-500" />
                      <span>{transaction.salesRep.name}</span>
                    </div>
                    <div className="text-gray-500">
                      Approved: {formatDate(transaction.approvedAt)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(calculateTotal(transaction.items).toString())}
                  </div>
                  <button
                    onClick={() => markAsPaid(transaction.id)}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FaMoneyBillWave className="mr-1" /> Mark as Paid
                  </button>
                </div>
              </div>

              {transaction.items.length > 0 && (
                <div className="mt-4 pl-2 border-l-4 border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Items:</h4>
                  <ul className="space-y-2">
                    {transaction.items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.product.name} ({item.quantity} × {formatCurrency(item.unitPrice)})
                        </span>
                        <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900">No pending payments</h3>
          <p className="mt-1 text-sm text-gray-500">All approved transactions have been paid.</p>
        </div>
      )}
    </div>
  );
};