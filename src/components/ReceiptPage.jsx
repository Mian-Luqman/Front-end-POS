// src/components/ReceiptPage.jsx - Multi-Tenant Version
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const fmt = (v) => (parseFloat(v) || 0).toFixed(2).replace(/\.00$/, "");

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#ffc107',
      color: 'white',
      padding: '15px 25px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease-out'
    }}>
      {message}
    </div>
  );
};

const PrintModal = ({ show, onClose, receiptData, storeName }) => {
  if (!show) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '50px',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '400px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        animation: 'slideDown 0.3s ease-out'
      }}>
        <h4 className="text-center mb-4">Print Preview</h4>
        
        <div style={{
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: '12px',
          border: '1px dashed #ccc',
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#f9f9f9'
        }}>
          <div className="text-center mb-2">
            <strong>{storeName}</strong><br/>
            <small>Powered by Sublime Tech POS</small>
          </div>
          <hr style={{borderTop: '1px dashed #000'}}/>
          <div className="text-center">
            <small>Order: #{receiptData.orderId}</small><br/>
            <small>{receiptData.date} | {receiptData.time}</small>
          </div>
          <hr style={{borderTop: '1px dashed #000'}}/>
          <table style={{width: '100%', fontSize: '11px'}}>
            <tbody>
              {receiptData.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td className="text-end">{item.quantity}x{fmt(item.price)}</td>
                  <td className="text-end">{fmt(item.quantity * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr style={{borderTop: '1px dashed #000'}}/>
          <div style={{fontSize: '11px'}}>
            <div className="d-flex justify-content-between">
              <span>Subtotal:</span>
              <span>Rs.{fmt(receiptData.subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Discount:</span>
              <span>Rs.{fmt(receiptData.discount)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong>Total:</strong>
              <strong>Rs.{fmt(receiptData.total)}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span>Paid:</span>
              <span>Rs.{fmt(receiptData.paid)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>{receiptData.due < 0 ? 'Change:' : 'Due:'}</span>
              <span>Rs.{fmt(Math.abs(receiptData.due))}</span>
            </div>
          </div>
          <hr style={{borderTop: '1px dashed #000'}}/>
          <div className="text-center">
            <small>Thank you for shopping!</small>
          </div>
        </div>

        <div className="d-grid gap-2">
          <button className="btn btn-primary" onClick={handlePrint}>
            🖨️ Print Receipt
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ show, onConfirm, onCancel, message }) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 10001,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        animation: 'slideDown 0.3s ease-out'
      }}>
        <h5 className="mb-3">⚠️ Confirmation</h5>
        <p>{message}</p>
        <div className="d-flex gap-2 justify-content-end">
          <button className="btn btn-danger" onClick={onConfirm}>Yes</button>
          <button className="btn btn-secondary" onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
};

export default function ReceiptPage({ orderData, onBack, onCancelOrder }) {
  const { currentUser, getStoreById } = useAuth();
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [storeName, setStoreName] = useState('Store');

  useEffect(() => {
    if (currentUser && currentUser.storeId) {
      const store = getStoreById(currentUser.storeId);
      if (store) {
        setStoreName(store.name);
      }
    }
  }, [currentUser]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleCancelClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
    showToast("Order Cancelled", 'error');
    setTimeout(() => {
      onCancelOrder();
    }, 500);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg border-0 print-area">
            <div className="card-header bg-success text-white text-center py-3">
              <h4 className="mb-0">✓ Order Successful!</h4>
            </div>
            
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h3 className="mb-1">{storeName}</h3>
                <p className="text-muted mb-1">Powered by Sublime Tech POS</p>
              </div>

              <hr className="my-4"/>

              <div className="row mb-4">
                <div className="col-6">
                  <p className="mb-1"><strong>Order ID:</strong> #{orderData.orderId}</p>
                  <p className="mb-1"><strong>Cashier:</strong> {orderData.cashier || 'N/A'}</p>
                </div>
                <div className="col-6 text-end">
                  <p className="mb-1"><strong>Date:</strong> {orderData.date}</p>
                  <p className="mb-1"><strong>Time:</strong> {orderData.time}</p>
                </div>
              </div>

              <div className="alert alert-light mb-4">
                <strong>Customer:</strong> Walking Customer
              </div>

              <div className="table-responsive mb-4">
                <table className="table table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">Rs.{fmt(item.price)}</td>
                        <td className="text-end">Rs.{fmt(item.quantity * item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="row justify-content-end">
                <div className="col-md-6">
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <strong>Rs.{fmt(orderData.subtotal)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Discount:</span>
                        <strong className="text-danger">-Rs.{fmt(orderData.discount)}</strong>
                      </div>
                      <hr/>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fs-5"><strong>Total:</strong></span>
                        <strong className="fs-5 text-success">Rs.{fmt(orderData.total)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Paid:</span>
                        <strong>Rs.{fmt(orderData.paid)}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="fs-6">
                          <strong>{orderData.due < 0 ? 'Change:' : 'Due:'}</strong>
                        </span>
                        <strong className={`fs-6 ${orderData.due < 0 ? 'text-success' : 'text-danger'}`}>
                          Rs.{fmt(Math.abs(orderData.due))}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer text-center py-3 bg-light no-print">
              <p className="text-muted mb-3">Thank you for shopping with us!</p>
              <div className="d-flex gap-3 justify-content-center">
                <button 
                  className="btn btn-primary btn-lg px-5"
                  onClick={() => setShowPrintModal(true)}
                >
                  🖨️ Print Receipt
                </button>
                <button 
                  className="btn btn-danger btn-lg px-5"
                  onClick={handleCancelClick}
                >
                  ❌ Cancel Order
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-4 no-print">
            <button className="btn btn-outline-secondary" onClick={onBack}>
              ← Back to POS
            </button>
          </div>
        </div>
      </div>

      <PrintModal 
        show={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        receiptData={orderData}
        storeName={storeName}
      />

      <ConfirmModal 
        show={showConfirmModal}
        message="Are you sure you want to cancel this order?"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowConfirmModal(false)}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}