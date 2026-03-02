// src/pages/inventory/LowStockAlerts.jsx - Multi-Tenant Version
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorageProducts from '../../hooks/useLocalStorageProducts';

export default function LowStockAlerts() {
  const navigate = useNavigate();
  const { products } = useLocalStorageProducts();
  const [searchTerm, setSearchTerm] = useState('');

  const alerts = useMemo(() => {
    const lowStock = products.filter(p => 
      !p.unlimited && p.quantity > 0 && p.quantity < 5
    );
    
    const outOfStock = products.filter(p => 
      !p.unlimited && p.quantity === 0
    );

    return { lowStock, outOfStock };
  }, [products]);

  const filteredLowStock = alerts.lowStock.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOutOfStock = alerts.outOfStock.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRecommendedReorder = (product) => {
    return Math.max(20, 5 * 3 - product.quantity);
  };

  const handleAddStock = (product) => {
    navigate('/inventory/adjust-stock', { state: { product } });
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>⚠️ Low Stock Alerts</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/inventory')}>
          ← Back to Inventory
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-warning">
            <div className="card-body text-center">
              <h1 className="text-warning mb-2">{alerts.lowStock.length}</h1>
              <h5 className="text-muted mb-0">Low Stock Items</h5>
              <small className="text-muted">Products with less than 5 units</small>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-danger">
            <div className="card-body text-center">
              <h1 className="text-danger mb-2">{alerts.outOfStock.length}</h1>
              <h5 className="text-muted mb-0">Out of Stock</h5>
              <small className="text-muted">Products with 0 units</small>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search alerts by product name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {alerts.lowStock.length === 0 && alerts.outOfStock.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: '64px' }}>✅</div>
          <h3 className="text-success mt-3">All Stock Levels are Healthy!</h3>
          <p className="text-muted">No low stock or out of stock items at the moment.</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/inventory')}>
            View Inventory
          </button>
        </div>
      ) : (
        <>
          {filteredOutOfStock.length > 0 && (
            <div className="mb-5">
              <h4 className="text-danger mb-3">🔴 Out of Stock ({filteredOutOfStock.length})</h4>
              <div className="row g-3">
                {filteredOutOfStock.map(product => (
                  <div key={product.id} className="col-md-6">
                    <div className="card border-danger">
                      <div className="card-body">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={product.image || 'https://via.placeholder.com/80'}
                            alt={product.name}
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                          />
                          <div className="flex-grow-1">
                            <h5 className="mb-1">{product.name}</h5>
                            <p className="text-muted mb-2">
                              {product.category && <span className="badge bg-secondary me-2">{product.category}</span>}
                              <span className="badge bg-danger">OUT OF STOCK</span>
                            </p>
                            <div className="text-muted small">
                              <strong>Current Stock:</strong> 0 units
                              <br />
                              <strong>Price:</strong> Rs.{product.price}
                              <br />
                              <strong>Recommended Reorder:</strong> {getRecommendedReorder(product)} units
                            </div>
                          </div>
                          <div>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleAddStock(product)}
                            >
                              Add Stock Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredLowStock.length > 0 && (
            <div>
              <h4 className="text-warning mb-3">🟡 Low Stock ({filteredLowStock.length})</h4>
              <div className="row g-3">
                {filteredLowStock.map(product => (
                  <div key={product.id} className="col-md-6">
                    <div className="card border-warning">
                      <div className="card-body">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={product.image || 'https://via.placeholder.com/80'}
                            alt={product.name}
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                          />
                          <div className="flex-grow-1">
                            <h5 className="mb-1">{product.name}</h5>
                            <p className="text-muted mb-2">
                              {product.category && <span className="badge bg-secondary me-2">{product.category}</span>}
                              <span className="badge bg-warning">LOW STOCK</span>
                            </p>
                            <div className="text-muted small">
                              <strong>Current Stock:</strong>{' '}
                              <span className="text-warning fw-bold">{product.quantity} units</span>
                              <br />
                              <strong>Price:</strong> Rs.{product.price}
                              <br />
                              <strong>Recommended Reorder:</strong> {getRecommendedReorder(product)} units
                            </div>
                          </div>
                          <div>
                            <button
                              className="btn btn-warning"
                              onClick={() => handleAddStock(product)}
                            >
                              Add Stock
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchTerm && filteredLowStock.length === 0 && filteredOutOfStock.length === 0 && (
            <div className="text-center py-5">
              <h5 className="text-muted">No alerts match your search: "{searchTerm}"</h5>
            </div>
          )}
        </>
      )}
    </div>
  );
}