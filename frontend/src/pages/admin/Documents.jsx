import React from 'react';
import DashboardHeader from '../../components/DashboardHeader';

export default function Documents() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <DashboardHeader 
        pageTitle="Document Management"
      />
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <p className="text-gray-500">Document management interface coming soon...</p>
      </div>
    </div>
  );
}