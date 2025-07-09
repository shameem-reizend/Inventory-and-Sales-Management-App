import React, { useEffect, useState } from 'react';
import apiClient from '../../services/axiosInterceptor';

interface TopProduct {
  id: number;
  name?: string;  // Making optional since your response doesn't show it
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export const TopSellingProducts: React.FC = () => {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await apiClient.get('/api/products/top');
        // Ensure we always have an array, even if single object is returned
        const data = Array.isArray(response.data) ? response.data : [response.data];
        setProducts(data);
      } catch (err) {
        setError('Failed to fetch top selling products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(parseFloat(value));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-yellow-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          Top Selling Products
        </h2>

        {products.length > 0 ? (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={product.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-600' :
                  index === 1 ? 'bg-gray-100 text-gray-600' :
                  index === 2 ? 'bg-amber-100 text-amber-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-medium text-gray-900">{product.name || `Product #${product.id}`}</h3>
                    <span className="text-sm text-gray-500">{product.quantity} sold</span>
                  </div>
                  <div className="mt-1 flex justify-between items-baseline">
                    <span className="text-sm text-gray-500">Unit Price: {formatCurrency(product.unitPrice)}</span>
                    <span className="text-sm font-semibold text-green-600">
                      Total: {formatCurrency(product.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No top selling products found
          </div>
        )}
      </div>
    </div>
  );
};