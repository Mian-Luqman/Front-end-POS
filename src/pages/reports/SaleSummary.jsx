// src/pages/reports/SaleSummary.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const fmt = (v) => (parseFloat(v) || 0).toFixed(2).replace(/\.00$/, "");

export default function SaleSummary() {
  const { currentUser } = useAuth();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [filterType, setFilterType] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('revenue');// revenue, profit, quantity, margin

  // Load data from localStorage
  useEffect(() => {
    if (!currentUser || !currentUser.storeId) return;
  
    const system = JSON.parse(localStorage.getItem('pos_system'));
    const store = system?.stores.find(s => s.id === currentUser.storeId);
  
    if (store) {
      const sortedOrders = [...(store.orders || [])]
        .sort((a, b) => b.orderId - a.orderId);
  
      setOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
      setProducts(store.products || []);
    }
  }, [currentUser]);
  

  // Filter orders based on date range
  useEffect(() => {
    let filtered = [...orders];
  
    if (filterType !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderId);
  
        if (filterType === 'today') return orderDate >= today;
        if (filterType === 'yesterday') {
          const y = new Date(today);
          y.setDate(y.getDate() - 1);
          return orderDate >= y && orderDate < today;
        }
        if (filterType === 'week') {
          const w = new Date(today);
          w.setDate(w.getDate() - 7);
          return orderDate >= w;
        }
        if (filterType === 'month') {
          const m = new Date(today);
          m.setMonth(m.getMonth() - 1);
          return orderDate >= m;
        }
        if (filterType === 'custom' && customStart && customEnd) {
          const start = new Date(customStart);
          const end = new Date(customEnd);
          end.setHours(23, 59, 59, 999);
          return orderDate >= start && orderDate <= end;
        }
        return true;
      });
    }
  
    setFilteredOrders(filtered);
  }, [filterType, customStart, customEnd, orders]);
  

  // Calculate product-wise summary
  const calculateSummary = () => {
    const summary = {};

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.id);
        
        if (!summary[item.id]) {
          summary[item.id] = {
            id: item.id,
            name: item.name,
            category: product?.category || '-',
            quantitySold: 0,
            costPrice: product?.purchasePrice || 0,
            sellingPrice: item.price,
            revenue: 0,
            cost: 0,
            profit: 0,
            profitMargin: 0
          };
        }

        summary[item.id].quantitySold += item.quantity;
        summary[item.id].revenue += item.price * item.quantity;
        summary[item.id].cost += (product?.purchasePrice || 0) * item.quantity;
      });
    });

    // Calculate profit and margin for each product
    Object.values(summary).forEach(item => {
      item.profit = item.revenue - item.cost;
      item.profitMargin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0;
    });

    return Object.values(summary);
  };

  const productSummary = calculateSummary();

  // Filter by search query
  const filteredSummary = productSummary.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort products
  const sortedSummary = [...filteredSummary].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.revenue - a.revenue;
      case 'profit':
        return b.profit - a.profit;
      case 'quantity':
        return b.quantitySold - a.quantitySold;
      case 'margin':
        return b.profitMargin - a.profitMargin;
      default:
        return 0;
    }
  });

  // Calculate overall stats
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalCost = productSummary.reduce((sum, item) => sum + item.cost, 0);
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const totalItemsSold = productSummary.reduce((sum, item) => sum + item.quantitySold, 0);
  const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

  // Top performers
  const topSelling = [...productSummary].sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 5);
  const topProfitable = [...productSummary].sort((a, b) => b.profit - a.profit).slice(0, 5);
  const topMargin = [...productSummary].sort((a, b) => b.profitMargin - a.profitMargin).slice(0, 5);

  // Get margin color
  const getMarginColor = (margin) => {
    if (margin >= 20) return 'success';
    if (margin >= 10) return 'warning';
    return 'danger';
  };

  return (
    <div className="container-fluid py-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Page Header */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body">
          <h1 className="h3 mb-2 text-primary">💼 Sale Summary Report</h1>
          <p className="text-muted mb-0">Analyze product performance, profit margins, and sales insights</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-lg-4 col-md-6">
          <div className="card border-0 border-start border-success border-4 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: '0.85rem', fontWeight: 600 }}>💰 Total Revenue</h6>
              <h2 className="mb-0 fw-bold text-success" style={{ fontSize: '2rem' }}>Rs.{fmt(totalRevenue)}</h2>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="card border-0 border-start border-danger border-4 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: '0.85rem', fontWeight: 600 }}>💵 Total Cost</h6>
              <h2 className="mb-0 fw-bold text-danger" style={{ fontSize: '2rem' }}>Rs.{fmt(totalCost)}</h2>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="card border-0 border-start border-info border-4 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: '0.85rem', fontWeight: 600 }}>📈 Total Profit</h6>
              <h2 className="mb-0 fw-bold text-info" style={{ fontSize: '2rem' }}>Rs.{fmt(totalProfit)}</h2>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="card border-0 border-start border-primary border-4 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: '0.85rem', fontWeight: 600 }}>📦 Items Sold</h6>
              <h2 className="mb-0 fw-bold text-primary" style={{ fontSize: '2rem' }}>{totalItemsSold}</h2>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="card border-0 border-start border-warning border-4 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: '0.85rem', fontWeight: 600 }}>🎯 Profit Margin</h6>
              <h2 className="mb-0 fw-bold text-warning" style={{ fontSize: '2rem' }}>{fmt(profitMargin)}%</h2>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="card border-0 border-start border-secondary border-4 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: '0.85rem', fontWeight: 600 }}>💸 Avg Order Value</h6>
              <h2 className="mb-0 fw-bold text-secondary" style={{ fontSize: '2rem' }}>Rs.{fmt(avgOrderValue)}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Search Product</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by product name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">Filter by Date</label>
              <select className="form-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {filterType === 'custom' && (
              <>
                <div className="col-md-2">
                  <label className="form-label fw-semibold">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-semibold">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="col-md-2">
              <label className="form-label fw-semibold">Sort By</label>
              <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="revenue">Revenue (High to Low)</option>
                <option value="profit">Profit (High to Low)</option>
                <option value="quantity">Quantity (Most Sold)</option>
                <option value="margin">Margin % (Best)</option>
              </select>
            </div>

            {(filterType !== 'all' || searchQuery) && (
              <div className="col-md-auto">
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    setFilterType('all');
                    setSearchQuery('');
                    setCustomStart('');
                    setCustomEnd('');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Summary Table */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">📊 Product-wise Performance</h5>
          {sortedSummary.length === 0 ? (
            <div className="text-center py-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="bi bi-graph-down text-muted mb-3" viewBox="0 0 16 16" style={{ opacity: 0.5 }}>
                <path fillRule="evenodd" d="M0 0h1v15h15v1H0V0Zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5Z"/>
              </svg>
              <h4 className="text-muted">No Sales Data</h4>
              <p className="text-muted">Make some sales to see the summary report</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Product Name</th>
                    <th className="text-center">Category</th>
                    <th className="text-center">Qty Sold</th>
                    <th className="text-end">Cost Price</th>
                    <th className="text-end">Selling Price</th>
                    <th className="text-end">Revenue</th>
                    <th className="text-end">Profit</th>
                    <th className="text-center">Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSummary.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-semibold">{item.name}</td>
                      <td className="text-center">
                        <span className="badge bg-secondary">{item.category}</span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-primary">{item.quantitySold}</span>
                      </td>
                      <td className="text-end text-muted">Rs.{fmt(item.costPrice)}</td>
                      <td className="text-end">Rs.{fmt(item.sellingPrice)}</td>
                      <td className="text-end fw-bold text-success">Rs.{fmt(item.revenue)}</td>
                      <td className="text-end fw-bold" style={{ color: item.profit >= 0 ? '#198754' : '#dc3545' }}>
                        Rs.{fmt(item.profit)}
                      </td>
                      <td className="text-center">
                        <span className={`badge bg-${getMarginColor(item.profitMargin)}`}>
                          {fmt(item.profitMargin)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Top Performers */}
      {productSummary.length > 0 && (
        <div className="row g-3">
          {/* Best Selling */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="card-title text-primary mb-3">🏆 Best Selling Products</h6>
                <ul className="list-group list-group-flush">
                  {topSelling.map((item, idx) => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <span>
                        <strong>{idx + 1}.</strong> {item.name}
                      </span>
                      <span className="badge bg-primary rounded-pill">{item.quantitySold} sold</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Most Profitable */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="card-title text-success mb-3">💎 Most Profitable Products</h6>
                <ul className="list-group list-group-flush">
                  {topProfitable.map((item, idx) => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <span>
                        <strong>{idx + 1}.</strong> {item.name}
                      </span>
                      <span className="badge bg-success rounded-pill">Rs.{fmt(item.profit)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Best Margin */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="card-title text-warning mb-3">📊 Best Profit Margins</h6>
                <ul className="list-group list-group-flush">
                  {topMargin.map((item, idx) => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <span>
                        <strong>{idx + 1}.</strong> {item.name}
                      </span>
                      <span className={`badge bg-${getMarginColor(item.profitMargin)} rounded-pill`}>
                        {fmt(item.profitMargin)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}