import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Download, Eye, CheckCircle, XCircle, AlertCircle, 
  FileText, Filter, Search, RefreshCw 
} from 'lucide-react';
import DashboardHeader from '../../components/DashboardHeader';
import documentsService from '../../api/services/documents.service';

const DOCUMENT_TYPES = {
  death_certificate: {
    label: 'Death Certificate',
    color: 'bg-blue-100 text-blue-800'
  },
  burial_permit: {
    label: 'Burial Permit',
    color: 'bg-green-100 text-green-800'
  },
  contract: {
    label: 'Service Contract',
    color: 'bg-purple-100 text-purple-800'
  },
  invoice: {
    label: 'Invoice',
    color: 'bg-yellow-100 text-yellow-800'
  },
  receipt: {
    label: 'Payment Receipt',
    color: 'bg-pink-100 text-pink-800'
  },
  other: {
    label: 'Other Document',
    color: 'bg-gray-100 text-gray-800'
  }
};

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [filters, setFilters] = useState({
    document_type: '',
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentsService.getAllDocuments({
        page: pagination.page,
        limit: pagination.limit,
        document_type: filters.document_type || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined
      });
      
      setDocuments(response.documents || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0
      }));
    } catch (error) {
      toast.error('Failed to fetch documents');
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await documentsService.getDocumentStats();
      setStats(response.stats || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      });
    } catch (error) {
      console.error('Error fetching document stats:', error);
    }
  };
  
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleDownload = async (document) => {
    try {
      const blob = await documentsService.downloadDocument(document.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Document downloaded successfully');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handlePreview = (document) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const handleReview = (document) => {
    setSelectedDocument(document);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedDocument) return;
    
    try {
      await documentsService.updateDocumentStatus(selectedDocument.id, status, reviewNotes);
      setShowReviewModal(false);
      
      // Update document in the list
      setDocuments(prev => prev.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, status, review_notes: reviewNotes } 
          : doc
      ));
      
      // Update stats
      fetchStats();
      
      toast.success(`Document marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update document status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };
  
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = filters.search 
      ? (doc.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
         doc.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
         doc.uploaded_by_name?.toLowerCase().includes(filters.search.toLowerCase()))
      : true;
      
    const matchesType = filters.document_type
      ? doc.document_type === filters.document_type
      : true;
      
    const matchesStatus = filters.status
      ? doc.status === filters.status
      : true;
      
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      <DashboardHeader 
        pageTitle="Document Management"
        actions={
          <button
            onClick={() => {
              fetchDocuments();
              fetchStats();
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-900">{stats.total}</p>
          <p className="mt-1 text-sm text-gray-500">Total Documents</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-900">{stats.pending}</p>
          <p className="mt-1 text-sm text-gray-500">Pending Review</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-900">{stats.approved}</p>
          <p className="mt-1 text-sm text-gray-500">Approved Documents</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-900">{stats.rejected}</p>
          <p className="mt-1 text-sm text-gray-500">Rejected Documents</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search documents..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 w-full input"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={filters.document_type}
            onChange={(e) => setFilters(prev => ({ ...prev, document_type: e.target.value }))}
            className="w-full input"
          >
            <option value="">All Document Types</option>
            {Object.entries(DOCUMENT_TYPES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="sm:w-48">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full input"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Related To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
                    </div>
                    <p className="mt-2">Loading documents...</p>
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No documents found
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {doc.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doc.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DOCUMENT_TYPES[doc.document_type]?.color || DOCUMENT_TYPES.other.color}`}>
                        {DOCUMENT_TYPES[doc.document_type]?.label || 'Document'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.uploaded_by_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.deceased_first_name && doc.deceased_last_name 
                        ? `${doc.deceased_first_name} ${doc.deceased_last_name}`
                        : doc.booking_id 
                          ? `Booking #${doc.booking_id}`
                          : 'Not specified'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(doc.status)}`}>
                        {doc.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePreview(doc)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Preview"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Download"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        {doc.status === 'pending' && (
                          <button
                            onClick={() => handleReview(doc)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Review"
                          >
                            {getStatusIcon('pending')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-secondary"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{pagination.total}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {showPreviewModal && selectedDocument && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">{selectedDocument.name}</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {selectedDocument.file_path?.match(/\.(jpg|jpeg|png)$/i) ? (
                <img
                  src={`/uploads/${selectedDocument.file_path}`}
                  alt={selectedDocument.name}
                  className="max-w-full h-auto"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded">
                  <FileText className="h-16 w-16 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Preview not available</p>
                  <p className="text-sm text-gray-500">Download the document to view it</p>
                </div>
              )}
              <div className="mt-4 bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-900 mb-2">Document Details</h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {DOCUMENT_TYPES[selectedDocument.document_type]?.label || 'Unknown'}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Uploaded By</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedDocument.uploaded_by_name || 'Unknown'}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedDocument.status)}`}>
                        {selectedDocument.status || 'pending'}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Date Uploaded</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(selectedDocument.created_at).toLocaleString()}
                    </dd>
                  </div>
                  {selectedDocument.review_notes && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Review Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedDocument.review_notes}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t">
              <button
                onClick={() => handleDownload(selectedDocument)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  if (selectedDocument.status === 'pending') {
                    handleReview(selectedDocument);
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                {selectedDocument.status === 'pending' ? 'Review' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Review Modal */}
      {showReviewModal && selectedDocument && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Review Document</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Document Information</h4>
                <p><span className="font-medium">Name:</span> {selectedDocument.name}</p>
                <p><span className="font-medium">Type:</span> {DOCUMENT_TYPES[selectedDocument.document_type]?.label || 'Unknown'}</p>
                <p><span className="font-medium">Uploaded by:</span> {selectedDocument.uploaded_by_name || 'Unknown'}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add your review comments here..."
                  className="w-full h-32 p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t">
              <button
                onClick={() => handleUpdateStatus('rejected')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => handleUpdateStatus('approved')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </button>
              <button
                onClick={() => setShowReviewModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}