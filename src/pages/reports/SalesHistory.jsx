// src/pages/reports/SalesHistory.jsx - Multi-Tenant Version
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const fmt = (v) => (parseFloat(v) || 0).toFixed(2).replace(/\.00$/, "");

export default function SalesHistory() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!currentUser || !currentUser.storeId) return;

    const system = JSON.parse(localStorage.getItem('pos_system'));
    const store = system?.stores.find(s => s.id === currentUser.storeId);
    
    if (store && store.orders) {
      const sortedOrders = [...store.orders].sort((a, b) => b.orderId - a.orderId);
      setOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
    }
  }, [currentUser]);

  useEffect(() => {
    let filtered = [...orders];

    if (filterType !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderId);

        if (filterType === 'today') {
          return orderDate >= today;
        } else if (filterType === 'yesterday') {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return orderDate >= yesterday && orderDate < today;
        } else if (filterType === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        } else if (filterType === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return orderDate >= monthAgo;
        } else if (filterType === 'custom' && customStart && customEnd) {
          const start = new Date(customStart);
          const end = new Date(customEnd);
          end.setHours(23, 59, 59, 999);
          return orderDate >= start && orderDate <= end;
        }
        return true;
      });
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(order => 
        order.orderId.toString().includes(searchQuery) ||
        order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredOrders(filtered);
  }, [filterType, customStart, customEnd, searchQuery, orders]);

  const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const totalDiscount = filteredOrders.reduce((sum, order) => sum + order.discount, 0);

  return (
    <div className="container-fluid py-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body">
          <h1 className="h3 mb-2 text-primary">📊 Sales History</h1>
          <p className="text-muted mb-0">View and analyze your sales orders with advanced filtering options</p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 border-start border-success border-4 shadow-sm">
            <div className="card-body">
              <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Sales</h6>
              <h2 className="mb-0 fw-bold" style={{ fontSize: '2rem' }}>Rs.{fmt(totalSales)}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 border-start border-primary border-4 shadow-sm">
            <div className="card-body">
              <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Orders</h6>
              <h2 className="mb-0 fw-bold" style={{ fontSize: '2rem' }}>{totalOrders}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 border-start border-warning border-4 shadow-sm">
            <div className="card-body">
              <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Discount</h6>
              <h2 className="mb-0 fw-bold" style={{ fontSize: '2rem' }}>Rs.{fmt(totalDiscount)}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Search Orders</label>
              <input
                type="text"
                className="form-control"
                placeholder="Order ID or Product Name"
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

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="bi bi-inbox text-muted mb-3" viewBox="0 0 16 16" style={{ opacity: 0.5 }}>
                <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm9.954 5H10.45a2.5 2.5 0 0 1-4.9 0H1.066l.32 2.562a.5.5 0 0 0 .497.438h12.234a.5.5 0 0 0 .496-.438L14.933 9zM3.809 3.563A1.5 1.5 0 0 1 4.981 3h6.038a1.5 1.5 0 0 1 1.172.563l3.7 4.625a.5.5 0 0 1 .105.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374l3.7-4.625z"/>
              </svg>
              <h4 className="text-muted">No Orders Found</h4>
              <p className="text-muted">Try adjusting your filters or create a new sale in POS</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Order ID</th>
                    <th>Date & Time</th>
                    <th>Items</th>
                    <th className="text-end">Subtotal</th>
                    <th className="text-center">Discount</th>
                    <th className="text-end">Total</th>
                    <th className="text-end">Paid</th>
                    <th className="text-end">Change/Due</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td>
                        <span className="badge bg-primary">#{order.orderId}</span>
                      </td>
                      <td>
                        <div className="fw-semibold">{order.date}</div>
                        <small className="text-muted">{order.time}</small>
                      </td>
                      <td>
                        <ul className="list-unstyled mb-0">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="text-muted small">
                              {item.name} × {item.quantity}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="text-end">Rs.{fmt(order.subtotal)}</td>
                      <td className="text-center">
                        {order.discount > 0 ? (
                          <span className="badge bg-danger">-Rs.{fmt(order.discount)}</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-end fw-bold text-success">Rs.{fmt(order.total)}</td>
                      <td className="text-end">Rs.{fmt(order.paid)}</td>
                      <td className="text-end fw-bold" style={{ color: order.due < 0 ? '#198754' : '#dc3545' }}>
                        {order.due < 0 ? 'Change: ' : 'Due: '}
                        Rs.{fmt(Math.abs(order.due))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}