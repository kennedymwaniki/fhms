import { useAuth } from '../hooks/useAuth';

export default function DashboardHeader({ pageTitle, actions }) {
  const { user } = useAuth();

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            {pageTitle}
          </h1>
         
        </div>
        <div className="flex items-center space-x-4">
          {actions}
        </div>
      </div>
    </div>
  );
}