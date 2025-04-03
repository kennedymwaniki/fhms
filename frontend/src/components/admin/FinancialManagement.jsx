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
    totalRevenue: 0,
    totalBookings: 0,
    avgTransactionValue: 0,
    pendingPayments: 0,
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTimeframe, setReportTimeframe] = useState('month');
  const [reportFormat, setReportFormat] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, [timeframe]);

  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch summary statistics from the server
      const summaryResponse = await api.get(`/payments/summary?timeframe=${timeframe}`);
      
      if (summaryResponse.data) {
        setSummary({
          totalRevenue: summaryResponse.data.totalRevenue || 0,
          totalBookings: summaryResponse.data.totalBookings || 0,
          avgTransactionValue: summaryResponse.data.avgTransactionValue || 0,
          pendingPayments: summaryResponse.data.pendingPayments || 0,
        });
      }
      
      // Fetch recent transactions
      const transactionsResponse = await api.get(`/payments/transactions?timeframe=${timeframe}`);
      
      if (transactionsResponse.data && transactionsResponse.data.transactions) {
        setTransactions(transactionsResponse.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Failed to load financial data');
      
      // Fallback to empty data
      setSummary({
        totalRevenue: 0,
        totalBookings: 0,
        avgTransactionValue: 0,
        pendingPayments: 0,
      });
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

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
    // Start the report generation process
    generateReport();
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
          </div>
          {isLoading ? (
            <div className="animate-pulse mt-4 h-6 bg-gray-200 rounded w-3/4"></div>
          ) : (
            <p className="mt-4 text-2xl font-semibold text-gray-900">
              ${summary.totalRevenue.toLocaleString()}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">Total Revenue</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
          {isLoading ? (
            <div className="animate-pulse mt-4 h-6 bg-gray-200 rounded w-3/4"></div>
          ) : (
            <p className="mt-4 text-2xl font-semibold text-gray-900">
              {summary.totalBookings}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">Total Bookings</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <Tag className="w-6 h-6" />
            </div>
          </div>
          {isLoading ? (
            <div className="animate-pulse mt-4 h-6 bg-gray-200 rounded w-3/4"></div>
          ) : (
            <p className="mt-4 text-2xl font-semibold text-gray-900">
              ${summary.avgTransactionValue.toLocaleString()}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">Average Transaction</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <CreditCard className="w-6 h-6" />
            </div>
            {!isLoading && (
              <span className="text-sm font-medium text-yellow-600">{summary.pendingPayments} pending</span>
            )}
          </div>
          {isLoading ? (
            <div className="animate-pulse mt-4 h-6 bg-gray-200 rounded w-3/4"></div>
          ) : (
            <p className="mt-4 text-2xl font-semibold text-gray-900">
              ${(summary.pendingPayments * (summary.avgTransactionValue || 0)).toLocaleString()}
            </p>
          )}
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
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
                    </div>
                    <p className="text-center mt-2 text-gray-500">Loading transactions...</p>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No transactions found for the selected period
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
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
                ))
              )}
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