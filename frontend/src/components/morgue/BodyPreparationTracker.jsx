import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const preparationStages = [
  { id: 'intake', name: 'Intake Processing' },
  { id: 'cleaning', name: 'Cleaning' },
  { id: 'preparation', name: 'Preparation' },
  { id: 'embalming', name: 'Embalming' },
  { id: 'dressing', name: 'Dressing' },
  { id: 'ready', name: 'Ready' },
];

const storageLocations = [
  'A01', 'A02', 'A03', 'B01', 'B02', 'B03', 'C01', 'C02', 'C03'
].map(id => ({
  id,
  status: Math.random() > 0.7 ? 'occupied' : 'available'
}));

export default function BodyPreparationTracker() {
  const [bodies, setBodies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBody, setNewBody] = useState({
    name: '',
    age: '',
    dateOfDeath: '',
    causeOfDeath: '',
    nextOfKin: '',
    contactNumber: '',
    storageLocation: '',
    currentStage: 'intake',
  });

  // Simulated data - replace with actual API calls
  useEffect(() => {
    setBodies([
      {
        id: 1,
        name: 'John Doe',
        age: 65,
        dateOfDeath: '2024-03-24',
        dateReceived: '2024-03-25',
        causeOfDeath: 'Natural causes',
        nextOfKin: 'Jane Doe',
        contactNumber: '555-0123',
        storageLocation: 'A01',
        currentStage: 'preparation',
        notes: 'Standard preparation requested',
      },
      // Add more mock data as needed
    ]);
  }, []);

  const handleAddBody = (e) => {
    e.preventDefault();
    const id = Date.now();
    setBodies(prev => [...prev, { ...newBody, id }]);
    setShowAddForm(false);
    setNewBody({
      name: '',
      age: '',
      dateOfDeath: '',
      causeOfDeath: '',
      nextOfKin: '',
      contactNumber: '',
      storageLocation: '',
      currentStage: 'intake',
    });
    toast.success('New case added successfully');
  };

  const updateStage = (bodyId, newStage) => {
    setBodies(prev =>
      prev.map(body =>
        body.id === bodyId
          ? { ...body, currentStage: newStage }
          : body
      )
    );
    toast.success('Stage updated successfully');
  };

  const filteredBodies = bodies.filter(body => {
    const matchesSearch = body.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      body.nextOfKin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || body.currentStage === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Body Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Intake
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or next of kin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full input"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full input"
          >
            <option value="all">All Stages</option>
            {preparationStages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Storage Overview</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-4">
          {storageLocations.map((location) => (
            <div
              key={location.id}
              className={`p-3 text-center rounded-lg border ${
                location.status === 'available'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              <span className="text-sm font-medium">{location.id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body List */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next of Kin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBodies.map((body) => (
                <tr key={body.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {body.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Received: {new Date(body.dateReceived).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {body.storageLocation}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={body.currentStage}
                      onChange={(e) => updateStage(body.id, e.target.value)}
                      className="text-sm border-gray-300 rounded-md"
                    >
                      {preparationStages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {body.nextOfKin}
                      </div>
                      <div className="text-sm text-gray-500">
                        {body.contactNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => {/* View details */}}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Body Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New Intake</h3>
            <form onSubmit={handleAddBody} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newBody.name}
                    onChange={(e) =>
                      setNewBody((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    value={newBody.age}
                    onChange={(e) =>
                      setNewBody((prev) => ({ ...prev, age: e.target.value }))
                    }
                    className="mt-1 input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Death
                </label>
                <input
                  type="date"
                  required
                  value={newBody.dateOfDeath}
                  onChange={(e) =>
                    setNewBody((prev) => ({ ...prev, dateOfDeath: e.target.value }))
                  }
                  className="mt-1 input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cause of Death
                </label>
                <input
                  type="text"
                  required
                  value={newBody.causeOfDeath}
                  onChange={(e) =>
                    setNewBody((prev) => ({ ...prev, causeOfDeath: e.target.value }))
                  }
                  className="mt-1 input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Next of Kin
                  </label>
                  <input
                    type="text"
                    required
                    value={newBody.nextOfKin}
                    onChange={(e) =>
                      setNewBody((prev) => ({ ...prev, nextOfKin: e.target.value }))
                    }
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={newBody.contactNumber}
                    onChange={(e) =>
                      setNewBody((prev) => ({
                        ...prev,
                        contactNumber: e.target.value,
                      }))
                    }
                    className="mt-1 input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Storage Location
                </label>
                <select
                  required
                  value={newBody.storageLocation}
                  onChange={(e) =>
                    setNewBody((prev) => ({
                      ...prev,
                      storageLocation: e.target.value,
                    }))
                  }
                  className="mt-1 input"
                >
                  <option value="">Select location</option>
                  {storageLocations
                    .filter((loc) => loc.status === 'available')
                    .map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.id}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}