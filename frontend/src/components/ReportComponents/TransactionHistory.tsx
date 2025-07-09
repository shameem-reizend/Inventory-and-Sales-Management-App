import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaClock, FaTimesCircle, FaUserTie, FaUser, FaShoppingCart, FaMoneyBillWave } from 'react-icons/fa';
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
    unitPrice: string;
  };
}

interface Transaction {
  id: number;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  isPaid: boolean;
  paidAt?: string;
  salesRep: User;
  approvedBy?: User;
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheckCircle className="mr-1" /> Approved
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FaClock className="mr-1" /> Pending
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FaTimesCircle className="mr-1" /> Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Unknown
        </span>
      );
  }
};

const getPaymentBadge = (isPaid: boolean) => {
  return isPaid ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      <FaMoneyBillWave className="mr-1" /> Paid
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
      Pending Payment
    </span>
  );
};

export const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/reports/transactions');
      setTransactions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch transaction history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const calculateTotal = (items: ProductItem[]) => {
    return items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={fetchTransactions}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Transaction History</h1>
            <p className="text-gray-600">All recent sales transactions</p>
          </div>
          <div className="mt-4 md:mt-0 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium flex items-center">
            <FaShoppingCart className="mr-2" />
            {transactions.length} Transactions
          </div>
        </div>

        <div className="space-y-6">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center space-x-4 mb-2 md:mb-0">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Transaction #{transaction.id}</h3>
                      <p className="text-sm text-gray-500">
                        Created: {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(transaction.status)}
                    {getPaymentBadge(transaction.isPaid)}
                  </div>
                </div>

                <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                      <FaUser className="mr-2 text-blue-500" /> Sales Representative
                    </h4>
                    <p className="font-medium">{transaction.salesRep.name}</p>
                    <p className="text-sm text-gray-500">{transaction.salesRep.email}</p>
                  </div>
                  {transaction.approvedBy && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                        <FaUserTie className="mr-2 text-green-500" /> Approved By
                      </h4>
                      <p className="font-medium">{transaction.approvedBy.name}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.approvedAt && formatDate(transaction.approvedAt)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SKU
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transaction.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{item.product.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.product.sku}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                            {formatCurrency(item.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-gray-50 flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Transaction Total</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatCurrency(calculateTotal(transaction.items).toString())}
                    </p>
                    {transaction.paidAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Paid on: {formatDate(transaction.paidAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-8 text-center rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
              <p className="mt-1 text-sm text-gray-500">There are no transactions to display at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};