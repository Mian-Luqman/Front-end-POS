// src/pages/inventory/StockHistory.jsx - Already works with updated hook!
// No changes needed - it uses useInventoryTransactions which is already updated
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useInventoryTransactions from '../../hooks/useInventoryTransactions';

export default function StockHistory() {
  const navigate = useNavigate();
  const { transactions } = useInventoryTransactions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.timestamp);
        
        if (dateFilter === 'today') {
          return transactionDate.toDateString() === now.toDateString();
        }
        
        if (dateFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= weekAgo;
        }
        
        if (dateFilter === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return transactionDate >= monthAgo;
        }
        
        return true;
      });
    }

    return filtered;
  }, [transactions, searchTerm, filterType, dateFilter]);

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export!');
      return;
    }

    const headers = ['Date', 'Product', 'Type', 'Quantity', 'Previous Stock', 'New Stock', 'Reason', 'Notes', 'Changed By'];
    const rows = filteredTransactions.map(t => [
      new Date(t.timestamp).toLocaleString('en-GB'),
      t.productName,
      t.type === 'add' ? 'Added' : 'Reduced',
      t.quantity,
      t.previousStock,
      t.newStock,
      t.reason || '-',
      t.notes || '-',
      t.changedBy
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Stock History</h2>
        <div className="btn-group">
          <button className="btn btn-success" onClick={handleExport}>
            📥 Export CSV
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory')}>
            ← Back
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Transactions</option>
            <option value="add">Added Only</option>
            <option value="reduce">Reduced Only</option>
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-primary">
            <div className="card-body text-center">
              <h6 className="text-muted">Total Transactions</h6>
              <h3 className="text-primary mb-0">{filteredTransactions.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-success">
            <div className="card-body text-center">
              <h6 className="text-muted">Stock Added</h6>
              <h3 className="text-success mb-0">
                {filteredTransactions.filter(t => t.type === 'add').length}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-danger">
            <div className="card-body text-center">
              <h6 className="text-muted">Stock Reduced</h6>
              <h3 className="text-danger mb-0">
                {filteredTransactions.filter(t => t.type === 'reduce').length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Date & Time</th>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Stock Change</th>
              <th>Reason/Notes</th>
              <th>Changed By</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-5">
                  No transaction history yet. Start adjusting stock!
                </td>
              </tr>
            ) : (
              filteredTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>
                    <small>
                      {new Date(transaction.timestamp).toLocaleDateString('en-GB')}
                      <br />
                      {new Date(transaction.timestamp).toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={transaction.productImage || 'https://via.placeholder.com/40'}
                        alt={transaction.productName}
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                      />
                      <strong>{transaction.productName}</strong>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${transaction.type === 'add' ? 'bg-success' : 'bg-danger'}`}>
                      {transaction.type === 'add' ? '➕ Added' : '➖ Reduced'}
                    </span>
                  </td>
                  <td>
                    <strong>{transaction.quantity}</strong>
                  </td>
                  <td>
                    <span className="badge bg-secondary">
                      {transaction.previousStock} → {transaction.newStock}
                    </span>
                  </td>
                  <td>
                    <div>
                      <strong className="text-primary">{transaction.reason}</strong>
                      {transaction.notes && (
                        <>
                          <br />
                          <small className="text-muted">{transaction.notes}</small>
                        </>
                      )}
                      {transaction.supplier && (
                        <>
                          <br />
                          <small className="text-info">Supplier: {transaction.supplier}</small>
                        </>
                      )}
                      {transaction.costPrice && (
                        <>
                          <br />
                          <small className="text-success">Cost: Rs.{transaction.costPrice}</small>
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    <small className="text-muted">{transaction.changedBy}</small>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-muted text-end">
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </div>
    </div>
  );
}