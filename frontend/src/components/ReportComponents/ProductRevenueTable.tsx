import { useState, useEffect } from 'react';
import { FaMobile, FaLaptop, FaBoxOpen } from 'react-icons/fa';
import apiClient from '../../services/axiosInterceptor';

interface RevenueData {
  productname: string;
  category: string;
  month: string;
  totalrevenue: string;
  totalunitssold: string;
}

interface ProductRevenueTableProps {
  className?: string;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'mobile':
      return <FaMobile className="text-blue-500" />;
    case 'laptops':
      return <FaLaptop className="text-purple-500" />;
    default:
      return <FaBoxOpen className="text-gray-500" />;
  }
};

const formatCurrency = (value: string | number) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue);
};

export const ProductRevenueTable = ({ className = '' }: ProductRevenueTableProps) => {

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
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">Product Revenue Details</h2>
      </div>
      {revenueReport.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price per Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {revenueReport.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.productname}</div>
                        <div className="text-gray-500 text-sm">{item.month}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-green-600">
                    {formatCurrency(item.totalrevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                    {item.totalunitssold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    {formatCurrency((parseFloat(item.totalrevenue) / parseInt(item.totalunitssold)).toString())}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          No revenue data available
        </div>
      )}
    </div>
  );
};