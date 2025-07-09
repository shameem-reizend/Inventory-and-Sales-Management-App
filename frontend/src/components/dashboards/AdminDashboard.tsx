import React, { useEffect, useState } from 'react';
import apiClient from '../../services/axiosInterceptor';
import { TopSellingProducts } from '../productComponents/TopSellingProduct';

export const AdminDashboard: React.FC = () => {

  const [userCount, setUserCount] = useState(0);
  const [managerCount, setManagerCount] = useState(0);
  const [salesRepCount, setSalesRepCount] = useState(0);
  const [accountantCount, setAccountantCount] = useState(0);
  const accessToken = localStorage.getItem('accessToken');

  const fetchUserCounts = async () => {
    try {
      const response = await apiClient.get('api/users', {
        headers: {
          Authorization: `Bearer ${accessToken || ''}`
        }
      });
      const data = response.data;
      setUserCount(data.length); 
      setManagerCount(data.filter((user: { role: string; }) => user.role === 'manager').length);
      setSalesRepCount(data.filter((user: { role: string; }) => user.role === 'sales').length);
      setAccountantCount(data.filter((user: { role: string; }) => user.role === 'accountant').length);
    } catch (error) {
      console.error('Failed to fetch user counts:', error);
    }
  };

  useEffect(() => {
    fetchUserCounts();
  }, []);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {/* User Card */}
        <div className="max-w-xs bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Users</h2>
                <p className="text-blue-100 mt-1">Total registered users</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-4xl font-extrabold text-white">{userCount}</p>
            </div>
          </div>
        </div>

        {/* Manager Card */}
        <div className="max-w-xs bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Managers</h2>
                <p className="text-purple-100 mt-1">Team leaders</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-4xl font-extrabold text-white">{managerCount}</p>
            </div>
          </div>
        </div>

        {/* Sales Rep Card */}
        <div className="max-w-xs bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Sales Reps</h2>
                <p className="text-green-100 mt-1">Sales team</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-4xl font-extrabold text-white">{salesRepCount}</p>
            </div>
          </div>
        </div>

        {/* Accountant Card */}
        <div className="max-w-xs bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Accountants</h2>
                <p className="text-amber-100 mt-1">Finance team</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-4xl font-extrabold text-white">{accountantCount}</p>
            </div>
          </div>
        </div>
      </div>

        <div className="my-6">
            <TopSellingProducts />
        </div>
    </div>
  );
};