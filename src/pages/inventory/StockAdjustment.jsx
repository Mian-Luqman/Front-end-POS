// src/pages/inventory/StockAdjustment.jsx - Multi-Tenant Version
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import useLocalStorageProducts from '../../hooks/useLocalStorageProducts';
import useInventoryTransactions from '../../hooks/useInventoryTransactions';

export default function StockAdjustment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { products, updateProduct } = useLocalStorageProducts();
  const { addTransaction } = useInventoryTransactions();

  const [mode, setMode] = useState('add');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [supplier, setSupplier] = useState('');

  useEffect(() => {
    if (location.state?.product) {
      setSelectedProduct(location.state.product);
    }
  }, [location.state]);

  const availableProducts = products.filter(p => !p.unlimited);

  const handleProductSelect = (e) => {
    const productId = parseInt(e.target.value);
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    setQuantity('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast.error('Please select a product!');
      return;
    }

    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      toast.error('Please enter a valid quantity!');
      return;
    }

    if (mode === 'reduce' && qty > selectedProduct.quantity) {
      toast.error(`Cannot reduce more than current stock (${selectedProduct.quantity})!`);
      return;
    }

    if (mode === 'reduce' && !reason) {
      toast.error('Please select a reason for stock reduction!');
      return;
    }

    const previousStock = selectedProduct.quantity;
    const newStock = mode === 'add' 
      ? previousStock + qty 
      : previousStock - qty;

    updateProduct(selectedProduct.id, { quantity: newStock });

    const transaction = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productImage: selectedProduct.image,
      type: mode,
      quantity: qty,
      previousStock,
      newStock,
      reason: mode === 'add' ? 'Stock Added' : reason,
      notes: notes || '',
      costPrice: mode === 'add' ? (costPrice || null) : null,
      supplier: mode === 'add' ? (supplier || null) : null
    };

    addTransaction(transaction);

    toast.success(
      mode === 'add' 
        ? `✅ ${qty} units added to "${selectedProduct.name}"!` 
        : `⚠️ ${qty} units reduced from "${selectedProduct.name}"!`
    );

    setSelectedProduct(null);
    setQuantity('');
    setReason('');
    setNotes('');
    setCostPrice('');
    setSupplier('');

    setTimeout(() => navigate('/inventory'), 1500);
  };

  const previewNewStock = () => {
    if (!selectedProduct || !quantity) return null;
    const qty = parseInt(quantity);
    if (mode === 'add') {
      return selectedProduct.quantity + qty;
    } else {
      return selectedProduct.quantity - qty;
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Stock Adjustment</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/inventory')}>
          ← Back to Inventory
        </button>
      </div>

      <div className="btn-group w-100 mb-4" role="group">
        <button
          className={`btn ${mode === 'add' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => setMode('add')}
        >
          ➕ Add Stock
        </button>
        <button
          className={`btn ${mode === 'reduce' ? 'btn-danger' : 'btn-outline-danger'}`}
          onClick={() => setMode('reduce')}
        >
          ➖ Reduce Stock
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Select Product *</label>
              <select
                className="form-select"
                value={selectedProduct?.id || ''}
                onChange={handleProductSelect}
                required
              >
                <option value="">-- Choose a product --</option>
                {availableProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current Stock: {p.quantity})
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="alert alert-info mb-3">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={selectedProduct.image || 'https://via.placeholder.com/60'}
                    alt={selectedProduct.name}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                  />
                  <div>
                    <strong>{selectedProduct.name}</strong>
                    <div className="text-muted">
                      Current Stock: <span className="badge bg-primary">{selectedProduct.quantity}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">
                Quantity to {mode === 'add' ? 'Add' : 'Reduce'} *
              </label>
              <input
                type="number"
                className="form-control"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                min="1"
                required
              />
            </div>

            {selectedProduct && quantity && (
              <div className="alert alert-warning mb-3">
                <strong>Preview:</strong> New stock will be{' '}
                <span className="badge bg-dark fs-6">{previewNewStock()}</span>
              </div>
            )}

            {mode === 'add' && (
              <>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Cost Price (Optional)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="Purchase price per unit"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Supplier Name (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      placeholder="Supplier name"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === 'reduce' && (
              <div className="mb-3">
                <label className="form-label">Reason for Reduction *</label>
                <select
                  className="form-select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                >
                  <option value="">-- Select reason --</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Expired">Expired</option>
                  <option value="Returned">Returned</option>
                  <option value="Theft">Theft</option>
                  <option value="Lost">Lost</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Notes (Optional)</label>
              <textarea
                className="form-control"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
              ></textarea>
            </div>

            <button type="submit" className={`btn ${mode === 'add' ? 'btn-success' : 'btn-danger'} w-100`}>
              {mode === 'add' ? '✅ Add Stock' : '⚠️ Reduce Stock'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}