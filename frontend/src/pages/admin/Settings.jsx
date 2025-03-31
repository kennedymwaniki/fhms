import React from 'react';
import DashboardHeader from '../../components/DashboardHeader';

export default function Settings() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <DashboardHeader 
        pageTitle="System Settings"
      />
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <p className="text-gray-500">System settings interface coming soon...</p>
      </div>
    </div>
  );
}