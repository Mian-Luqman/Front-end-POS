// src/pages/products/ProductCategories.jsx - Multi-Tenant Version
import { useState } from 'react';
import toast from 'react-hot-toast';
import useLocalStorageProducts from '../../hooks/useLocalStorageProducts';
import { useNavigate } from 'react-router-dom';

const PLACEHOLDER = 'https://via.placeholder.com/40';

export default function ProductCategories() {
  const navigate = useNavigate();
  const { products, saveProducts } = useLocalStorageProducts();
  const [searchCategory, setSearchCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const categories = [...new Set(products.map(p => p.category).filter(c => c))].map(category => ({
    name: category,
    count: products.filter(p => p.category === category).length
  })).filter(c => c.name.toLowerCase().includes(searchCategory.toLowerCase()));

  const handleEditCategory = (categoryName) => {
    setEditingCategory(categoryName);
    setNewCategoryName(categoryName);
  };

  const saveEditedCategory = (oldName) => {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty!");
      return;
    }

    const updatedProducts = products.map(p => 
      p.category === oldName ? { ...p, category: newCategoryName } : p
    );

    saveProducts(updatedProducts);
    toast.success(`All products of category "${oldName}" updated to "${newCategoryName}"!`);
    setEditingCategory(null);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setNewCategoryName('');
  };

  const handleDeleteCategory = (categoryName) => {
    if (window.confirm(`Delete category "${categoryName}" and ALL its products?`)) {
      const remainingProducts = products.filter(p => p.category !== categoryName);
      saveProducts(remainingProducts);
      toast.success(`Category "${categoryName}" and all its products deleted!`);
    }
  };

  const handleViewProducts = (categoryName) => {
    setSelectedCategory(categoryName);
    setShowModal(true);
  };

  const filteredCategoryProducts = products.filter(p => p.category === selectedCategory);

  const handleEditCategoryProducts = () => {
    setShowModal(false);
    navigate(`/products/categories/${selectedCategory}/edit-products`);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between mb-3">
        <h2>Product Categories</h2>
        <input 
          type="text" 
          className="form-control w-25" 
          placeholder="Search Category" 
          value={searchCategory} 
          onChange={e => setSearchCategory(e.target.value)} 
        />
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Category Name</th>
              <th>No of Products</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan="3" className="text-center py-5">No categories found. Add products with categories!</td></tr>
            ) : (
              categories.map(c => (
                <tr key={c.name}>
                  <td>
                    {editingCategory === c.name ? (
                      <input 
                        type="text" 
                        className="form-control" 
                        value={newCategoryName} 
                        onChange={e => setNewCategoryName(e.target.value)} 
                      />
                    ) : (
                      <strong>{c.name}</strong>
                    )}
                  </td>
                  <td>{c.count}</td>
                  <td>
                    <div className="btn-group">
                      {editingCategory === c.name ? (
                        <>
                          <button className="btn btn-sm btn-success me-2" onClick={() => saveEditedCategory(c.name)}>
                            Save
                          </button>
                          <button className="btn btn-sm btn-secondary me-2" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-sm btn-primary me-2" onClick={() => handleEditCategory(c.name)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-info text-white me-2" onClick={() => handleViewProducts(c.name)}>
                            View
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteCategory(c.name)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Products in Category: {selectedCategory}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategoryProducts.length === 0 ? (
                        <tr><td colSpan="5" className="text-center">No products in this category</td></tr>
                      ) : (
                        filteredCategoryProducts.map(p => (
                          <tr key={p.id}>
                            <td><img src={p.image || PLACEHOLDER} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover' }} /></td>
                            <td>{p.name}</td>
                            <td>Rs.{p.price}</td>
                            <td>{p.unlimited ? '♾️ Unlimited' : p.quantity}</td>
                            <td>
                              <span className={`badge ${p.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                {p.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleEditCategoryProducts}>
                  Edit Products
                </button>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}