import React, { useState } from 'react';
import apiClient from '../../services/axiosInterceptor';

interface Product {
  id: number;
  name: string;
  sku: string;
  unitPrice: string;
  stock: number;
}

interface OrderItem {
  productId: number;
  quantity: number;
}

const CreateSalesOrder: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stockWarnings, setStockWarnings] = useState<{[key: number]: string}>({});

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/api/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const openModal = () => {
    fetchProducts();
    setIsModalOpen(true);
    setStockWarnings({});
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setOrderItems([]);
    setError(null);
    setSuccess(null);
    setStockWarnings({});
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: 0, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...orderItems];
    const removedItem = newItems[index];
    newItems.splice(index, 1);
    setOrderItems(newItems);
    
    // Clear warning if this product was causing a stock issue
    if (removedItem.productId > 0) {
      const newWarnings = {...stockWarnings};
      delete newWarnings[removedItem.productId];
      setStockWarnings(newWarnings);
    }
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: unknown) => {
    const newItems = [...orderItems];
    const oldProductId = newItems[index].productId;
    
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);

    // Check stock when product or quantity changes
    if (field === 'productId' || field === 'quantity') {
      const productId = field === 'productId' ? Number(value) : newItems[index].productId;
      const quantity = field === 'quantity' ? Number(value) : newItems[index].quantity;
      
      if (productId > 0) {
        const product = products.find(p => p.id === productId);
        if (product) {
          const newWarnings = {...stockWarnings};
          
          if (quantity > product.stock) {
            newWarnings[productId] = `Only ${product.stock} available in stock`;
          } else {
            delete newWarnings[productId];
          }
          
          setStockWarnings(newWarnings);
        }
      }
      
      // Clear warning if product was changed
      if (field === 'productId' && oldProductId > 0 && oldProductId !== productId) {
        const newWarnings = {...stockWarnings};
        delete newWarnings[oldProductId];
        setStockWarnings(newWarnings);
      }
    }
  };

  const validateOrder = () => {
    const newWarnings: {[key: number]: string} = {};
    let isValid = true;

    orderItems.forEach(item => {
      if (item.productId > 0) {
        const product = products.find(p => p.id === item.productId);
        if (product && item.quantity > product.stock) {
          newWarnings[item.productId] = `Only ${product.stock} available in stock`;
          isValid = false;
        }
      }
    });

    setStockWarnings(newWarnings);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Filter out any items with productId = 0 (not selected)
      const validItems = orderItems.filter(item => item.productId > 0);
      
      if (validItems.length === 0) {
        throw new Error('Please add at least one valid product');
      }

      // Validate stock quantities
      if (!validateOrder()) {
        throw new Error('Some items exceed available stock');
      }

      await apiClient.post('/api/sales', { items: validItems });
      setSuccess('Sales order created successfully!');
      setTimeout(() => {
        closeModal();
        // You might want to add a callback here to refresh the orders list
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={openModal}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
      >
        Create New Sales Order
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Create New Sales Order</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {orderItems.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    const warning = product && stockWarnings[product.id];
                    
                    return (
                      <div key={index} className="flex flex-col sm:flex-row gap-4 items-end border-b pb-4">
                        <div className="flex-1 w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product
                          </label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, 'productId', parseInt(e.target.value))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                            required
                          >
                            <option value={0}>Select a product</option>
                            {products.map((product) => (
                              <option 
                                key={product.id} 
                                value={product.id}
                                disabled={orderItems.some(i => i.productId === product.id && i.productId !== item.productId)}
                              >
                                {product.name} - ₹{product.unitPrice} (Stock: {product.stock})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-24">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={product?.stock || undefined}
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border ${
                              warning ? 'border-red-300 bg-red-50' : ''
                            }`}
                            required
                          />
                          {warning && (
                            <p className="mt-1 text-sm text-red-600">{warning}</p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Item
                    </button>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isLoading || orderItems.length === 0 || Object.keys(stockWarnings).length > 0}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : 'Create Order'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSalesOrder;