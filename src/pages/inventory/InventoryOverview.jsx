// src/pages/inventory/InventoryOverview.jsx - Multi-Tenant Version
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorageProducts from '../../hooks/useLocalStorageProducts';

export default function InventoryOverview() {
  const navigate = useNavigate();
  const { products } = useLocalStorageProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const lowStockItems = products.filter(p => !p.unlimited && p.quantity > 0 && p.quantity < 5).length;
    const outOfStockItems = products.filter(p => !p.unlimited && p.quantity === 0).length;
    const totalStockValue = products.reduce((sum, p) => {
      if (p.unlimited) return sum;
      return sum + (p.quantity * p.price);
    }, 0);

    return { totalProducts, lowStockItems, outOfStockItems, totalStockValue };
  }, [products]);

  const getStockStatus = (product) => {
    if (product.unlimited) return { text: 'Unlimited', color: 'info', badge: 'bg-info' };
    if (product.quantity === 0) return { text: 'Out of Stock', color: 'danger', badge: 'bg-danger' };
    if (product.quantity < 5) return { text: 'Low Stock', color: 'warning', badge: 'bg-warning' };
    if (product.quantity < 10) return { text: 'Medium', color: 'primary', badge: 'bg-primary' };
    return { text: 'Healthy', color: 'success', badge: 'bg-success' };
  };

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus === 'low') {
      filtered = filtered.filter(p => !p.unlimited && p.quantity > 0 && p.quantity < 5);
    } else if (filterStatus === 'out') {
      filtered = filtered.filter(p => !p.unlimited && p.quantity === 0);
    } else if (filterStatus === 'healthy') {
      filtered = filtered.filter(p => p.unlimited || p.quantity >= 10);
    }

    return filtered;
  }, [products, searchTerm, filterStatus]);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Inventory Overview</h2>
        <div className="btn-group">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/inventory/adjust-stock')}
          >
            📦 Adjust Stock
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/inventory/history')}
          >
            📜 View History
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-center border-primary">
            <div className="card-body">
              <h6 className="text-muted mb-2">Total Products</h6>
              <h2 className="text-primary mb-0">{stats.totalProducts}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center border-warning">
            <div className="card-body">
              <h6 className="text-muted mb-2">Low Stock Items</h6>
              <h2 className="text-warning mb-0">{stats.lowStockItems}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center border-danger">
            <div className="card-body">
              <h6 className="text-muted mb-2">Out of Stock</h6>
              <h2 className="text-danger mb-0">{stats.outOfStockItems}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center border-success">
            <div className="card-body">
              <h6 className="text-muted mb-2">Total Stock Value</h6>
              <h2 className="text-success mb-0">Rs.{stats.totalStockValue.toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search by product name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <div className="btn-group w-100" role="group">
            <button
              className={`btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilterStatus('all')}
            >
              All
            </button>
            <button
              className={`btn ${filterStatus === 'low' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setFilterStatus('low')}
            >
              Low Stock
            </button>
            <button
              className={`btn ${filterStatus === 'out' ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => setFilterStatus('out')}
            >
              Out of Stock
            </button>
            <button
              className={`btn ${filterStatus === 'healthy' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilterStatus('healthy')}
            >
              Healthy
            </button>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Stock Value</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-5">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'No products match your filters.' 
                    : 'No products in inventory yet.'}
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => {
                const status = getStockStatus(product);
                const stockValue = product.unlimited ? '∞' : `Rs.${(product.quantity * product.price).toLocaleString()}`;

                return (
                  <tr key={product.id}>
                    <td>
                      <img
                        src={product.image || 'https://via.placeholder.com/50'}
                        alt={product.name}
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
                      />
                    </td>
                    <td><strong>{product.name}</strong></td>
                    <td>
                      <small className="text-muted">{product.category || '-'}</small>
                    </td>
                    <td>
                      <span className={`badge ${status.badge} fs-6`}>
                        {product.unlimited ? '∞' : product.quantity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td>
                      <strong>{stockValue}</strong>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate('/inventory/adjust-stock', { state: { product } })}
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-muted text-end">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  );
}