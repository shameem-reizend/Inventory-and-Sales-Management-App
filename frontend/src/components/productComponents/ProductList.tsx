import React, { useEffect, useState } from 'react'
import apiClient from '../../services/axiosInterceptor'
import { TrashIcon } from 'lucide-react';
import { EditProduct } from '../productComponents/EditProduct';
import { AddProduct } from '../productComponents/AddProduct';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitPrice: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('api/products');
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        {error} <button onClick={fetchAllProducts} className="ml-2 text-blue-600">Retry</button>
      </div>
    );
  }

  const deleteProduct = async (productId: number) => {
      try {
          await apiClient.delete(`api/products/${productId}`);
          setProducts(products.filter(product => product.id !== productId));
          console.log('User deleted successfully');
      } catch (error) {
          console.error('Failed to delete user:', error);
      }
  };

  return (
    <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">All Products</h2>
            <AddProduct onProductAdded={fetchAllProducts}/>
            <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${product.stock < 10 ? 'bg-red-100 text-red-800' : 
                            product.stock < 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(parseFloat(product.unitPrice))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex justify-center space-x-2">
                            <EditProduct 
                                product={product} 
                                onProductUpdated={fetchAllProducts}
                            />
                            <button className="text-red-600 hover:text-red-900">
                            <TrashIcon onClick={() => deleteProduct(product.id)} className="h-5 w-5" />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
  );
};