import React, { useState, useEffect } from 'react';
import { Download, Upload, FileText, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import documentsService from '../../api/services/documents.service';
import DashboardHeader from '../../components/DashboardHeader';

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
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadData, setUploadData] = useState({
    type: 'death_certificate',
    file: null,
    description: ''
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await documentsService.getMyDocuments();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only PDF, JPG, PNG, and DOC files are allowed');
      return;
    }

    setUploadData(prev => ({ ...prev, file }));
  };

  const handleUpload = async () => {
    if (!uploadData.file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('document_type', uploadData.type);
      formData.append('description', uploadData.description || '');

      const response = await documentsService.uploadDocument(formData);
      await loadDocuments();
      setShowUploadModal(false);
      setUploadData({ type: 'death_certificate', file: null, description: '' });
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload document';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
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
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentsService.deleteDocument(documentId);
      setDocuments(docs => docs.filter(d => d.id !== documentId));
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader pageTitle="Documents" />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        pageTitle="Documents" 
        actions={
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </button>
        }
      />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg text-gray-500">No documents available</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100"
            >
              Upload your first document
            </button>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <li key={doc.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <FileText className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{doc.name}</h3>
                          <div className="mt-1 flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DOCUMENT_TYPES[doc.document_type]?.color || DOCUMENT_TYPES.other.color}`}>
                              {DOCUMENT_TYPES[doc.document_type]?.label || 'Document'}
                            </span>
                            <p className="text-sm text-gray-500">
                              Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Download"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setSelectedDocument(doc)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Preview"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Document Type</label>
                <select
                  value={uploadData.type}
                  onChange={(e) => setUploadData(prev => ({ ...prev, type: e.target.value }))}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  {Object.entries(DOCUMENT_TYPES).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  rows="3"
                  placeholder="Add a description for this document..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">File</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={handleFileUpload}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                    {uploadData.file && (
                      <p className="text-sm text-gray-600">{uploadData.file.name}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadData({ type: 'death_certificate', file: null, description: '' });
                  }}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading || !uploadData.file}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">{selectedDocument.name}</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {selectedDocument.file_path.match(/\.(jpg|jpeg|png)$/i) ? (
                <img
                  src={`/uploads/${selectedDocument.file_path}`}
                  alt={selectedDocument.name}
                  className="max-w-full h-auto"
                />
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded">
                  <FileText className="h-16 w-16 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Preview not available</p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t">
              <button
                onClick={() => handleDownload(selectedDocument)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}