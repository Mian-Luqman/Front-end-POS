// src/pages/products/CreateProduct.jsx - Multi-Tenant Version
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import useLocalStorageProducts from '../../hooks/useLocalStorageProducts';

export default function CreateProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const editProduct = location.state?.product || null;
  const { addProduct, updateProduct } = useLocalStorageProducts();

  // Load custom lists from store
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    if (currentUser && currentUser.storeId) {
      const system = JSON.parse(localStorage.getItem('pos_system'));
      const store = system.stores.find(s => s.id === currentUser.storeId);
      
      if (store) {
        setUnits(store.customUnits || []);
        setCategories(store.customCategories || []);
        setBrands(store.customBrands || []);
      }
    }
  }, [currentUser]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [newValue, setNewValue] = useState('');

  const [formData, setFormData] = useState({
    name: editProduct?.name || '',
    sku: editProduct?.sku || '',
    brand: editProduct?.brand || '',
    category: editProduct?.category || '',
    unit: editProduct?.unit || '',
    price: editProduct?.price || '',
    purchasePrice: editProduct?.purchasePrice || '',
    quantity: editProduct?.unlimited ? '' : (editProduct?.quantity || 0),
    unlimited: editProduct?.unlimited || false,
    description: editProduct?.description || '',
    expiryDate: editProduct?.expiryDate || '',
    image: editProduct?.image || '',
    isActive: editProduct?.isActive ?? true,
    taxEnabled: editProduct?.taxEnabled || false,
    shippingPrice: editProduct?.shippingPrice || '',
    taxPrice: editProduct?.taxPrice || '',
    loadPrice: editProduct?.loadPrice || ''
  });

  const openModal = (type) => {
    setModalType(type);
    setNewValue('');
    setShowModal(true);
  };

  const handleAddNew = () => {
    if (!newValue.trim()) {
      toast.error('Please enter a value');
      return;
    }

    const trimmedValue = newValue.trim();
    const system = JSON.parse(localStorage.getItem('pos_system'));
    const storeIndex = system.stores.findIndex(s => s.id === currentUser.storeId);

    if (storeIndex === -1) return;

    if (modalType === 'unit') {
      if (units.includes(trimmedValue)) {
        toast.error('Unit already exists');
        return;
      }
      const newUnits = [...units, trimmedValue];
      system.stores[storeIndex].customUnits = newUnits;
      setUnits(newUnits);
      setFormData(p => ({ ...p, unit: trimmedValue }));
      toast.success('Unit added successfully');
    } else if (modalType === 'category') {
      if (categories.includes(trimmedValue)) {
        toast.error('Category already exists');
        return;
      }
      const newCategories = [...categories, trimmedValue];
      system.stores[storeIndex].customCategories = newCategories;
      setCategories(newCategories);
      setFormData(p => ({ ...p, category: trimmedValue }));
      toast.success('Category added successfully');
    } else if (modalType === 'brand') {
      if (brands.includes(trimmedValue)) {
        toast.error('Brand already exists');
        return;
      }
      const newBrands = [...brands, trimmedValue];
      system.stores[storeIndex].customBrands = newBrands;
      setBrands(newBrands);
      setFormData(p => ({ ...p, brand: trimmedValue }));
      toast.success('Brand added successfully');
    }

    localStorage.setItem('pos_system', JSON.stringify(system));
    setShowModal(false);
    setNewValue('');
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const calculateTotalTax = () => {
    let total = 0;
    if (formData.shippingPrice) total += Number(formData.shippingPrice) || 0;
    if (formData.taxPrice) total += Number(formData.taxPrice) || 0;
    if (formData.loadPrice) total += Number(formData.loadPrice) || 0;
    return total;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let finalPurchasePrice = Number(formData.purchasePrice);
    
    // Add tax/additional charges if enabled
    if (formData.taxEnabled) {
      finalPurchasePrice += calculateTotalTax();
    }

    const productData = {
      ...formData,
      price: Number(formData.price),
      purchasePrice: finalPurchasePrice,
      quantity: formData.unlimited ? Infinity : Number(formData.quantity || 0),
      shippingPrice: formData.shippingPrice ? Number(formData.shippingPrice) : 0,
      taxPrice: formData.taxPrice ? Number(formData.taxPrice) : 0,
      loadPrice: formData.loadPrice ? Number(formData.loadPrice) : 0
    };

    if (editProduct) {
      updateProduct(editProduct.id, productData);
      toast.success("Product updated successfully!");
    } else {
      addProduct(productData);
      toast.success("Product created successfully!");
    }
    navigate('/products');
  };

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">{editProduct ? 'Edit' : 'Create'} Product</h2>
      <form onSubmit={handleSubmit} className="row g-3">

        <div className="col-md-6">
          <label>Name *</label>
          <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
        </div>
        
        <div className="col-md-6">
          <label>SKU *</label>
          <input type="text" className="form-control" required value={formData.sku} onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))} />
        </div>

        <div className="col-md-6">
          <label>Brand</label>
          <div className="input-group">
            <select 
              className="form-select" 
              value={formData.brand} 
              onChange={e => setFormData(p => ({ ...p, brand: e.target.value }))}
            >
              <option value="">Select Brand</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <button type="button" className="btn btn-outline-primary" onClick={() => openModal('brand')}>
              + Assign New
            </button>
          </div>
        </div>

        <div className="col-md-6">
          <label>Category</label>
          <div className="input-group">
            <select className="form-select" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="button" className="btn btn-outline-primary" onClick={() => openModal('category')}>
              + Assign New
            </button>
          </div>
        </div>

        <div className="col-md-6">
          <label>Base Purchase Price *</label>
          <input type="number" className="form-control" required value={formData.purchasePrice} onChange={e => setFormData(p => ({ ...p, purchasePrice: e.target.value }))} />
        </div>

        <div className="col-md-6">
          <label className="form-label">Additional Charges</label>
          <div className="form-check form-switch">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="taxToggle"
              checked={formData.taxEnabled} 
              onChange={e => setFormData(p => ({ 
                ...p, 
                taxEnabled: e.target.checked,
                shippingPrice: e.target.checked ? p.shippingPrice : '',
                taxPrice: e.target.checked ? p.taxPrice : '',
                loadPrice: e.target.checked ? p.loadPrice : ''
              }))} 
            />
            <label className="form-check-label" htmlFor="taxToggle">Enable Additional Charges</label>
          </div>
        </div>

        {formData.taxEnabled && (
          <div className="col-12">
            <div style={{ 
              border: '1px solid rgb(161 161 161)', 
              borderRadius: '8px', 
              padding: '20px', 
              backgroundColor: '#f9f9f9',
              marginBottom: '10px'
            }}>
              <h6 className="mb-3" style={{ color: '#666', fontWeight: '600' }}>Additional Charges Details</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label>Shipping Price</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.shippingPrice} 
                    onChange={e => setFormData(p => ({ ...p, shippingPrice: e.target.value }))} 
                    placeholder="Optional"
                  />
                </div>

                <div className="col-md-6">
                  <label>Tax Price</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.taxPrice} 
                    onChange={e => setFormData(p => ({ ...p, taxPrice: e.target.value }))} 
                    placeholder="Optional"
                  />
                </div>

                <div className="col-md-6">
                  <label>Load Price</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.loadPrice} 
                    onChange={e => setFormData(p => ({ ...p, loadPrice: e.target.value }))} 
                    placeholder="Optional"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Total Additional Charges</label>
                  <div className="form-control bg-light" style={{ cursor: 'default', fontWeight: '600' }}>
                    Rs. {calculateTotalTax().toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="col-md-6">
          <label>Selling Price *</label>
          <input type="number" className="form-control" required value={formData.price} onChange={e => setFormData(p => ({ ...p, price: e.target.value }))} />
        </div>

        <div className="col-md-6">
          <label className="form-label">Unit</label>
          <div className="input-group">
            <select 
              className="form-select" 
              value={formData.unit} 
              onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))}
            >
              <option value="">Select Unit</option>
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <button 
              type="button" 
              className="btn btn-outline-primary" 
              onClick={() => openModal('unit')}
            >
              + Assign New
            </button>
          </div>
        </div>

        <div className="col-md-6">
          <label>Stock</label>
          <div className="input-group">
            <input 
              type="number" 
              className="form-control" 
              value={formData.unlimited ? '' : formData.quantity} 
              onChange={e => setFormData(p => ({ ...p, quantity: e.target.value }))} 
              disabled={formData.unlimited} 
              placeholder={formData.unlimited ? 'Unlimited' : ''} 
            />
            <div className="input-group-text">
              <input 
                type="checkbox" 
                checked={formData.unlimited} 
                onChange={e => setFormData(p => ({ ...p, unlimited: e.target.checked, quantity: e.target.checked ? Infinity : 0 }))} 
              />
              <label className="ms-2">Unlimited</label>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <label>Description</label>
          <textarea className="form-control" rows="2" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
        </div>

        <div className="col-md-6">
          <label>Expiry Date</label>
          <input type="date" className="form-control" value={formData.expiryDate} onChange={e => setFormData(p => ({ ...p, expiryDate: e.target.value }))} />
        </div>

        <div className="col-md-6">
          <label>Image</label>
          <input type="file" className="form-control" accept="image/*" onChange={handleImage} />
          {formData.image && <img src={formData.image} alt="preview" className="mt-2 img-thumbnail" style={{ width: 120, height: 120, objectFit: 'cover' }} />}
        </div>

        <div className="col-md-6">
          <label>Status</label>
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" checked={formData.isActive} onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))} />
            <label>{formData.isActive ? 'Active' : 'Inactive'}</label>
          </div>
        </div>

        <div className="col-12 mt-4">
          <button type="submit" className="btn btn-primary btn-lg">
            {editProduct ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New {modalType === 'unit' ? 'Unit' : modalType === 'category' ? 'Category' : 'Brand'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={`Enter new ${modalType}`}
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddNew()}
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleAddNew}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}