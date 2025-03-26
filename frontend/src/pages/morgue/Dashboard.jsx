import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, CheckSquare, Truck, AlertTriangle, Users, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import DashboardHeader from '../../components/DashboardHeader';

export default function MorgueDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [bodies, setBodies] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Simulated data - replace with actual API calls
  useEffect(() => {
    // Fetch active bodies and tasks
    setTimeout(() => {
      setBodies([
        { id: 1, name: 'John Doe', status: 'In Preparation', arrival: '2024-03-25', storage: 'B12' },
        { id: 2, name: 'Jane Smith', status: 'Ready', arrival: '2024-03-24', storage: 'A05' },
        { id: 3, name: 'Mike Johnson', status: 'Pending', arrival: '2024-03-26', storage: 'C08' },
      ]);
      setTasks([
        { id: 1, title: 'Embalming - John Doe', priority: 'high', due: '2024-03-27' },
        { id: 2, title: 'Documentation - Jane Smith', priority: 'medium', due: '2024-03-26' },
        { id: 3, title: 'Transport Arrangement', priority: 'low', due: '2024-03-28' },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const stats = [
    {
      title: 'Bodies in Storage',
      value: bodies.length,
      icon: Box,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Pending Tasks',
      value: tasks.length,
      icon: CheckSquare,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Scheduled Transfers',
      value: 2,
      icon: Truck,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Storage Alerts',
      value: 1,
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600',
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const headerActions = (
    <>
      <Link
        to="/dashboard/morgue/bodies"
        className="btn-primary"
      >
        <Users className="w-4 h-4 mr-2" />
        Body Management
      </Link>
      <Link
        to="/dashboard/morgue/tasks"
        className="btn-secondary"
      >
        <Calendar className="w-4 h-4 mr-2" />
        View All Tasks
      </Link>
    </>
  );

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        pageTitle="Morgue Dashboard"
        actions={headerActions}
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Bodies */}
            <div className="bg-white rounded-lg shadow-sm h-full">
              <div className="p-6 border-b">
                <h2 className="text-lg font-medium text-gray-900">Current Bodies</h2>
              </div>
              <div className="divide-y">
                {isLoading ? (
                  <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : (
                  bodies.map((body) => (
                    <div key={body.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{body.name}</p>
                          <p className="text-sm text-gray-500">
                            Arrival: {new Date(body.arrival).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            Storage: {body.storage}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {body.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tasks */}
            <div className="bg-white rounded-lg shadow-sm h-full">
              <div className="p-6 border-b">
                <h2 className="text-lg font-medium text-gray-900">Pending Tasks</h2>
              </div>
              <div className="divide-y">
                {isLoading ? (
                  <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(task.due).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}