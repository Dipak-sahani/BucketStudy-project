import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Home } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center">
          <Shield className="h-24 w-24 text-red-600" />
        </div>
        <h1 className="mt-6 text-4xl font-extrabold text-gray-900">403</h1>
        <p className="mt-2 text-lg font-medium text-gray-900">Access Denied</p>
        <p className="mt-2 text-gray-600">
          You don't have permission to access this page.
        </p>
        <div className="mt-6 space-y-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent 
                     rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 
                     hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-primary-500"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="block w-full text-center text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Or go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;