import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  CreditCard,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/config';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function FinancialManagement() {
  const [timeframe, setTimeframe] = useState('month');
  const [reportType, setReportType] = useState('revenue');
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 85600,
    totalBookings: 42,
    avgTransactionValue: 2038,
    pendingPayments: 12,
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTimeframe, setReportTimeframe] = useState('month');
  const [reportFormat, setReportFormat] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  // Simulated data - replace with actual API calls
  useEffect(() => {
    setTransactions([
      {
        id: 1,
        date: '2024-03-25',
        description: 'Premium Funeral Package',
        amount: 3500,
        status: 'completed',
        customer: 'John Smith',
        paymentMethod: 'Credit Card'
      },
      {
        id: 2,
        date: '2024-03-24',
        description: 'Basic Memorial Service',
        amount: 1800,
        status: 'pending',
        customer: 'Mary Johnson',
        paymentMethod: 'Bank Transfer'
      },
      // Add more transactions as needed
    ]);
  }, []);

  const generateReport = () => {
    setShowReportModal(true);
  };

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      // Generate a unique filename for the download
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `Financial_Report_${reportTimeframe}_${timestamp}.xlsx`;
      
      // Call the API to generate the report
      const response = await api.get(`/payments/report?timeframe=${reportTimeframe}&type=${reportFormat}`, {
        responseType: 'blob' // Important for handling file downloads
      });
      
      // Create a download link for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report generated and downloaded successfully');
      setShowReportModal(false);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    // Simulated download - replace with actual API call
    toast.success('Downloading report');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Financial Management</h2>
        <div className="flex space-x-4">
          <button
            onClick={generateReport}
            className="btn-primary"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-green-600">+12.5%</span>
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-900">
            ${summary.totalRevenue.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-500">Total Revenue</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-blue-600">+8.2%</span>
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-900">
            {summary.totalBookings}
          </p>
          <p className="mt-1 text-sm text-gray-500">Total Bookings</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <Tag className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-purple-600">+5.8%</span>
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-900">
            ${summary.avgTransactionValue.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-500">Average Transaction</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-yellow-600">{summary.pendingPayments} pending</span>
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-900">
            ${(summary.pendingPayments * summary.avgTransactionValue).toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-500">Pending Payments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="input sm:w-48"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>

        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="input sm:w-48"
        >
          <option value="revenue">Revenue</option>
          <option value="services">Services</option>
          <option value="payments">Payments</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          <button
            onClick={downloadReport}
            className="btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Generate Financial Report</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Timeframe
                </label>
                <select
                  value={reportTimeframe}
                  onChange={(e) => setReportTimeframe(e.target.value)}
                  className="w-full input"
                >
                  <option value="week">Current Week</option>
                  <option value="month">Current Month</option>
                  <option value="half_year">Last 6 Months</option>
                  <option value="year">Last 12 Months</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Content
                </label>
                <select
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                  className="w-full input"
                >
                  <option value="all">Comprehensive Report (All Data)</option>
                  <option value="payments">Payments Only</option>
                  <option value="services">Services Only</option>
                </select>
              </div>
              
              <p className="text-sm text-gray-500">
                The report will include a summary sheet and detailed data based on your selection.
                It will be downloaded as an Excel file.
              </p>
            </div>
            
            <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowReportModal(false)}
                type="button"
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                type="button"
                className="btn-primary"
              >
                {isGenerating ? 'Generating...' : 'Generate & Download'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}