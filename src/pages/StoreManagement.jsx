// src/pages/StoreManagement.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function StoreManagement() {
  const { getAllStores, createStore, updateStore, deleteStore } = useAuth();
  const [stores, setStores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEditStore, setCurrentEditStore] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    type: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = () => {
    const allStores = getAllStores();
    setStores(allStores);
  };

  const handleOpenModal = (store = null) => {
    if (store) {
      setEditMode(true);
      setCurrentEditStore(store);
      setFormData({
        name: store.name,
        owner: store.owner,
        type: store.type,
        address: store.address || '',
        phone: store.phone || ''
      });
    } else {
      setEditMode(false);
      setCurrentEditStore(null);
      setFormData({
        name: '',
        owner: '',
        type: '',
        address: '',
        phone: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: '', owner: '', type: '', address: '', phone: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editMode) {
      const result = updateStore(currentEditStore.id, formData);
      if (result.success) {
        toast.success('Store updated successfully!');
        loadStores();
        handleCloseModal();
      } else {
        toast.error(result.message);
      }
    } else {
      const result = createStore(formData);
      if (result.success) {
        toast.success('Store created successfully!');
        loadStores();
        handleCloseModal();
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleDelete = (store) => {
    if (window.confirm(`Are you sure you want to delete "${store.name}"? This will delete all users, products, and data associated with this store!`)) {
      const result = deleteStore(store.id);
      if (result.success) {
        toast.success('Store deleted successfully!');
        loadStores();
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>🏪 Store Management</h2>
          <p className="text-muted mb-0">Manage all POS stores</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          ➕ Add New Store
        </button>
      </div>

      {/* Stores Grid */}
      <div className="row">
        {stores.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info text-center">
              <h5>No stores found</h5>
              <p className="mb-0">Create your first store to get started!</p>
            </div>
          </div>
        ) : (
          stores.map(store => (
            <div key={store.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">{store.name}</h5>
                </div>
                <div className="card-body">
                  <p className="mb-2">
                    <strong>Owner:</strong> {store.owner}
                  </p>
                  <p className="mb-2">
                    <strong>Type:</strong> 
                    <span className="badge bg-info ms-2">{store.type}</span>
                  </p>
                  {store.address && (
                    <p className="mb-2">
                      <strong>Address:</strong> {store.address}
                    </p>
                  )}
                  {store.phone && (
                    <p className="mb-2">
                      <strong>Phone:</strong> {store.phone}
                    </p>
                  )}
                  <hr />
                  <div className="d-flex justify-content-between text-muted small">
                    <span>👥 {store.users?.length || 0} Users</span>
                    <span>📦 {store.products?.length || 0} Products</span>
                    <span>🛒 {store.orders?.length || 0} Orders</span>
                  </div>
                </div>
                <div className="card-footer bg-light">
                  <button 
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleOpenModal(store)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(store)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Store Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? '✏️ Edit Store' : '➕ Add New Store'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Store Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Khan Grocery"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Owner Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      placeholder="e.g., Muhammad Khan"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Store Type *</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Grocery">Grocery Store</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Retail">Retail Store</option>
                      <option value="Commission Shop">Commission Shop</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Store address"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Contact number"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editMode ? 'Update Store' : 'Create Store'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}