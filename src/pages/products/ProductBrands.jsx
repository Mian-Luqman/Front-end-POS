// src/pages/products/ProductBrands.jsx - Multi-Tenant Version
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useLocalStorageProducts from '../../hooks/useLocalStorageProducts';

export default function ProductBrands() {
  const navigate = useNavigate();
  const { products, saveProducts } = useLocalStorageProducts();
  const [searchBrand, setSearchBrand] = useState('');
  const [editingBrand, setEditingBrand] = useState(null);
  const [newBrandName, setNewBrandName] = useState('');

  const brands = [...new Set(products.map(p => p.brand).filter(b => b))].map(brand => ({
    name: brand,
    count: products.filter(p => p.brand === brand).length
  })).filter(b => b.name.toLowerCase().includes(searchBrand.toLowerCase()));

  const handleEditBrand = (brandName) => {
    setEditingBrand(brandName);
    setNewBrandName(brandName);
  };

  const saveEditedBrand = (oldName) => {
    if (!newBrandName.trim()) {
      toast.error("Brand name cannot be empty!");
      return;
    }

    const updatedProducts = products.map(p => 
      p.brand === oldName ? { ...p, brand: newBrandName } : p
    );

    saveProducts(updatedProducts);
    toast.success(`All products of "${oldName}" updated to "${newBrandName}"!`);
    setEditingBrand(null);
  };

  const handleDeleteBrand = (brandName) => {
    if (window.confirm(`Delete brand "${brandName}" and ALL its products?`)) {
      const remainingProducts = products.filter(p => p.brand !== brandName);
      saveProducts(remainingProducts);
      toast.success(`Brand "${brandName}" and all its products deleted!`);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between mb-3">
        <h2>Product Brands</h2>
        <input 
          type="text" 
          className="form-control w-25" 
          placeholder="Search Brand" 
          value={searchBrand} 
          onChange={e => setSearchBrand(e.target.value)} 
        />
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Brand Name</th>
              <th>No of Products</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 ? (
              <tr><td colSpan="3" className="text-center py-5">No brands found. Add products with brands!</td></tr>
            ) : (
              brands.map(b => (
                <tr key={b.name}>
                  <td>
                    {editingBrand === b.name ? (
                      <input 
                        type="text" 
                        className="form-control" 
                        value={newBrandName} 
                        onChange={e => setNewBrandName(e.target.value)} 
                      />
                    ) : (
                      <strong>{b.name}</strong>
                    )}
                  </td>
                  <td>{b.count}</td>
                  <td>
                    <div className="btn-group">
                      {editingBrand === b.name ? (
                        <button className="btn btn-sm btn-success" onClick={() => saveEditedBrand(b.name)}>
                          Save
                        </button>
                      ) : (
                        <button className="btn btn-sm btn-primary me-2" onClick={() => handleEditBrand(b.name)}>
                          Edit
                        </button>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBrand(b.name)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}