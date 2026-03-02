// src/pages/UserManagement.jsx - Updated for Multi-Tenant
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function UserManagement() {
  const { currentUser, getAllUsers, getAllStores, register, updateUser, deleteUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEditUser, setCurrentEditUser] = useState(null);
  
  const isAdmin = currentUser?.role === 'Admin';
  const isManager = currentUser?.role === 'Manager';
  
  const allowedRole = isAdmin ? 'Manager' : 'Cashier';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: allowedRole,
    storeId: ''
  });

  useEffect(() => {
    loadUsers();
    if (isAdmin) {
      loadStores();
    }
  }, []);

  const loadStores = () => {
    const allStores = getAllStores();
    setStores(allStores);
  };

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditMode(true);
      setCurrentEditUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        storeId: user.storeId || ''
      });
    } else {
      setEditMode(false);
      setCurrentEditUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: allowedRole,
        storeId: isManager ? currentUser.storeId : ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: '', email: '', password: '', role: allowedRole, storeId: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate store selection for admin
    if (isAdmin && !formData.storeId) {
      toast.error('Please select a store!');
      return;
    }

    if (editMode) {
      const updateData = { 
        name: formData.name, 
        email: formData.email, 
        role: formData.role 
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      const result = updateUser(currentEditUser.id, updateData);
      
      if (result.success) {
        toast.success('User updated successfully!');
        loadUsers();
        handleCloseModal();
      } else {
        toast.error(result.message);
      }
    } else {
      if (!formData.password) {
        toast.error('Password is required for new users!');
        return;
      }

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: allowedRole,
        storeId: isAdmin ? formData.storeId : currentUser.storeId
      };

      const result = register(userData);
      
      if (result.success) {
        toast.success(`${allowedRole} created successfully!`);
        loadUsers();
        handleCloseModal();
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      const result = deleteUser(user.id);
      
      if (result.success) {
        toast.success('User deleted successfully!');
        loadUsers();
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>👥 User Management</h2>
          <p className="text-muted mb-0">
            {isAdmin && 'Manage Managers across all stores'}
            {isManager && 'Manage Cashiers for your store'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          ➕ Add New {allowedRole}
        </button>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  {isAdmin && <th>Store</th>}
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? "6" : "5"} className="text-center text-muted">
                      No {allowedRole.toLowerCase()}s found. Create your first {allowedRole.toLowerCase()}!
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${
                          user.role === 'Manager' ? 'bg-primary' : 'bg-success'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      {isAdmin && (
                        <td>
                          <span className="badge bg-info">{user.storeName}</span>
                        </td>
                      )}
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleOpenModal(user)}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(user)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? `✏️ Edit ${allowedRole}` : `➕ Add New ${allowedRole}`}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {isAdmin && !editMode && (
                    <div className="mb-3">
                      <label className="form-label">Select Store *</label>
                      <select
                        className="form-select"
                        value={formData.storeId}
                        onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                        required
                      >
                        <option value="">Choose a store</option>
                        {stores.map(store => (
                          <option key={store.id} value={store.id}>
                            {store.name} ({store.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Password {editMode && '(Leave blank to keep current)'}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editMode}
                      placeholder={editMode ? 'Leave blank to keep current password' : 'Enter password'}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <input
                      type="text"
                      className="form-control"
                      value={allowedRole}
                      disabled
                      readOnly
                    />
                    <small className="text-muted">
                      {isAdmin && 'You can only create Managers'}
                      {isManager && 'You can only create Cashiers'}
                    </small>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editMode ? `Update ${allowedRole}` : `Create ${allowedRole}`}
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