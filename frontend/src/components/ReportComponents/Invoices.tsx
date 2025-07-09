import React from 'react';
import { FaFileExcel, FaFilePdf, FaDownload } from 'react-icons/fa';
import apiClient from '../../services/axiosInterceptor';
import { useState } from 'react';

export const Invoices: React.FC = () => {
  const [isLoading, setIsLoading] = useState<'excel' | 'pdf' | null>(null);

  const downloadFile = async (type: 'excel' | 'pdf') => {
    try {
      setIsLoading(type);
      
      // Set appropriate headers for each file type
      const config = {
        responseType: 'blob' as const,
        headers: {
          'Accept': type === 'excel' 
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            : 'application/pdf'
        }
      };

      const response = await apiClient.get(`api/reports/download/${type}`, config);

      // Verify we received blob data
      if (!(response.data instanceof Blob)) {
        throw new Error('Invalid file data received');
      }

      // Try to get filename from content-disposition header
      let filename = `report_${new Date().toISOString().split('T')[0]}.${type}`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i);
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();

      // Cleanup - add delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      alert(`Failed to download ${type.toUpperCase()} file. Please try again.`);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <FaDownload className="mr-2 text-blue-500" /> Export Invoices
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => downloadFile('excel')}
          disabled={isLoading === 'excel'}
          className={`flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isLoading === 'excel' ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading === 'excel' ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Preparing Excel...
            </span>
          ) : (
            <span className="flex items-center">
              <FaFileExcel className="mr-2" /> Download Excel
            </span>
          )}
        </button>

        <button
          onClick={() => downloadFile('pdf')}
          disabled={isLoading === 'pdf'}
          className={`flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${isLoading === 'pdf' ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading === 'pdf' ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Preparing PDF...
            </span>
          ) : (
            <span className="flex items-center">
              <FaFilePdf className="mr-2" /> Download PDF
            </span>
          )}
        </button>
      </div>

      <p className="mt-3 text-sm text-gray-500">
        Export all invoices for accounting purposes. Excel format is recommended for data analysis.
      </p>
    </div>
  );
};