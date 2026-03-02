// src/pages/profile/Profile.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function Profile() {
  const { currentUser, updateProfile } = useAuth();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [image, setImage] = useState(currentUser?.image || '');

  const isAdmin = currentUser?.role === 'Admin';

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isAdmin) {
      toast.error('Admin profile cannot be modified!');
      return;
    }

    updateProfile({ name, image });
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">👤 My Profile</h4>
            </div>
            
            <div className="card-body">
              {isAdmin && (
                <div className="alert alert-warning mb-4">
                  🔒 Admin profile is protected and cannot be modified.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Profile Image */}
                <div className="text-center mb-4">
                  <img
                    src={image || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="rounded-circle mb-3"
                    style={{ width: 150, height: 150, objectFit: 'cover' }}
                  />
                  {!isAdmin && (
                    <div>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <small className="text-muted">Upload profile picture</small>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isAdmin}
                    required
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={currentUser?.email}
                    disabled
                  />
                  <small className="text-muted">
                    {isAdmin 
                      ? '🔒 Email cannot be changed' 
                      : '🔒 Only Admin can change email'}
                  </small>
                </div>

                {/* Role (Read-only) */}
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentUser?.role}
                    disabled
                  />
                </div>

                {/* Password Notice */}
                <div className="alert alert-info">
                  🔒 Password can only be changed by Admin
                </div>

                {/* Submit Button */}
                {!isAdmin && (
                  <button type="submit" className="btn btn-primary w-100">
                    💾 Update Profile
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}