import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardOverview from './DashboardOverview';
import UserManagement from './UserManagement';
import FinancialManagement from '../../components/admin/FinancialManagement';
import ServicesManagement from '../../components/admin/ServicesManagement';
import Documents from './Documents';
import Settings from './Settings';

export default function AdminDashboard() {
  return (
    <Routes>
      <Route index element={<DashboardOverview />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="services" element={<ServicesManagement />} />
      <Route path="reports" element={<FinancialManagement />} />
      <Route path="documents" element={<Documents />} />
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/dashboard/admin" replace />} />
    </Routes>
  );
}