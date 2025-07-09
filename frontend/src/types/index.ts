export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales' | 'accountant';
  avatar?: string;
}

export interface DashboardStats {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles: User['role'][];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  price: number;
  category: string;
}

export interface SalesOrder {
  id: string;
  customerName: string;
  products: { productId: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'approved' | 'shipped' | 'delivered';
  createdAt: string;
  salesRepId: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  status: 'paid' | 'unpaid' | 'pending';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}