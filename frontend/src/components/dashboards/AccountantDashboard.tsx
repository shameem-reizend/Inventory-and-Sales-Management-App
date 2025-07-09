import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaDollarSign, FaBoxOpen } from 'react-icons/fa';
import apiClient from '../../services/axiosInterceptor';
import { ProductRevenueTable } from '../ReportComponents/ProductRevenueTable'; // Adjust the import path
import { TransactionHistory } from '../ReportComponents/TransactionHistory';

interface RevenueData {
  productname: string;
  category: string;
  month: string;
  totalrevenue: string;
  totalunitssold: string;
}

export const AccountantDashboard: React.FC = () => {
  const [revenueReport, setRevenueReport] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRevenueReport = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('api/reports/revenue');
      setRevenueReport(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch revenue data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRevenueReport();
  }, []);

  const totalRevenue = revenueReport.reduce((sum, item) => sum + parseFloat(item.totalrevenue), 0);
  const totalUnits = revenueReport.reduce((sum, item) => sum + parseInt(item.totalunitssold), 0);

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
            onClick={getRevenueReport}
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Revenue Dashboard</h1>
            {/* <p className="text-gray-600">Monthly Performance Report</p> */}
          </div>
          <div className="mt-4 md:mt-0 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium flex items-center">
            <FaCalendarAlt className="mr-2" />
            {revenueReport.length > 0 ? revenueReport[0].month : 'Loading...'}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(totalRevenue)}
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FaDollarSign className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Units Sold</p>
                <h3 className="text-2xl font-bold mt-1">{totalUnits}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaBoxOpen className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Products</p>
                <h3 className="text-2xl font-bold mt-1">{revenueReport.length}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaBoxOpen className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        <ProductRevenueTable />
        <TransactionHistory />
      </div>
    </div>
  );
};