// src/components/PosDashboard.jsx - Multi-Tenant Version
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import useLocalStorageProducts from "../hooks/useLocalStorageProducts";
import ReceiptPage from "./ReceiptPage";
import "./PosDashboard.css";

const PLACEHOLDER = "https://via.placeholder.com/120x100/f0f0f0/aaaaaa?text=No+Image";
const fmt = (v) => (parseFloat(v) || 0).toFixed(2).replace(/\.00$/, "");

export default function PosDashboard() {
  const { currentUser } = useAuth();
  const { products, updateProduct } = useLocalStorageProducts();
  const [carts, setCarts] = useState([]);
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBarcode, setSearchBarcode] = useState("");
  
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const filteredProducts = products
    .filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => p.isActive !== false);

  const subtotal = carts.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalAfterDiscount = Math.max(0, subtotal - (parseFloat(orderDiscount) || 0));
  const due = totalAfterDiscount - (parseFloat(paid) || 0);

  const getAvailableStock = (productId) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return 0;
    if (prod.unlimited) return Infinity;
    
    const cartItem = carts.find(c => c.id === productId);
    const cartQty = cartItem ? cartItem.quantity : 0;
    return Math.max(0, (prod.quantity || 0) - cartQty);
  };

  const addToCart = (productId) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) {
      toast.error("Product not found!");
      return;
    }

    if (!prod.unlimited && (prod.quantity === 0 || prod.quantity === undefined)) {
      toast.error("❌ Product out of stock!");
      return;
    }

    const availableStock = getAvailableStock(productId);
    
    if (!prod.unlimited && availableStock <= 0) {
      toast.error("⚠️ Insufficient stock!");
      return;
    }

    setCarts(prev => {
      const exists = prev.find(x => x.id === productId);
      if (exists) {
        return prev.map(x => x.id === productId ? { ...x, quantity: x.quantity + 1 } : x);
      }
      return [...prev, {
        id: prod.id,
        name: prod.name,
        price: Number(prod.price),
        quantity: 1
      }];
    });
    toast.success(`${prod.name} added to cart!`);
  };

  const increaseQuantity = (productId) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const availableStock = getAvailableStock(productId);
    
    if (!prod.unlimited && availableStock <= 0) {
      toast.error("⚠️ Cannot add more! Insufficient stock");
      return;
    }

    setCarts(prev => prev.map(p => p.id === productId ? { ...p, quantity: p.quantity + 1 } : p));
  };

  const decreaseQuantity = (productId) => {
    setCarts(prev => prev.map(p => p.id === productId ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p));
  };

  const removeFromCart = (productId) => {
    setCarts(prev => prev.filter(p => p.id !== productId));
  };

  useEffect(() => {
    if (searchBarcode.trim()) {
      const found = products.find(p => p.sku === searchBarcode || p.id === Number(searchBarcode));
      if (found) {
        addToCart(found.id);
      } else {
        toast.error("Product not found with this barcode/sku!");
      }
      setSearchBarcode("");
    }
  }, [searchBarcode]);

  const clearCart = () => {
    if (carts.length === 0 || window.confirm("Clear cart?")) {
      setCarts([]);
      setOrderDiscount(0);
      setPaid(0);
      toast.success("Cart cleared");
    }
  };

  const handleCheckout = () => {
    if (carts.length === 0) {
      toast.error("Cart is empty!");
      return;
    }

    if (!currentUser || !currentUser.storeId) {
      toast.error("User session invalid!");
      return;
    }

    // Deduct stock
    carts.forEach(cartItem => {
      const prod = products.find(p => p.id === cartItem.id);
      if (prod && !prod.unlimited) {
        const newQuantity = Math.max(0, (prod.quantity || 0) - cartItem.quantity);
        updateProduct(prod.id, { quantity: newQuantity });
      }
    });

    const orderData = {
      orderId: Date.now(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      items: carts.map(item => ({...item})),
      subtotal,
      discount: parseFloat(orderDiscount) || 0,
      total: totalAfterDiscount,
      paid: parseFloat(paid) || 0,
      due,
      storeId: currentUser.storeId,
      cashier: currentUser.name
    };

    // Save to store's orders
    const system = JSON.parse(localStorage.getItem('pos_system'));
    const storeIndex = system.stores.findIndex(s => s.id === currentUser.storeId);
    
    if (storeIndex !== -1) {
      if (!system.stores[storeIndex].orders) {
        system.stores[storeIndex].orders = [];
      }
      system.stores[storeIndex].orders.push(orderData);
      localStorage.setItem('pos_system', JSON.stringify(system));
    }

    toast.success("✅ Order Successful!");

    setCurrentOrder(orderData);
    setShowReceipt(true);

    setCarts([]);
    setOrderDiscount(0);
    setPaid(0);
  };

  const handleCancelOrder = () => {
    if (currentOrder) {
      // Restore stock
      currentOrder.items.forEach(item => {
        const prod = products.find(p => p.id === item.id);
        if (prod && !prod.unlimited) {
          const restoredQuantity = (prod.quantity || 0) + item.quantity;
          updateProduct(prod.id, { quantity: restoredQuantity });
        }
      });

      // Remove order
      const system = JSON.parse(localStorage.getItem('pos_system'));
      const storeIndex = system.stores.findIndex(s => s.id === currentUser.storeId);
      
      if (storeIndex !== -1) {
        system.stores[storeIndex].orders = system.stores[storeIndex].orders.filter(
          o => o.orderId !== currentOrder.orderId
        );
        localStorage.setItem('pos_system', JSON.stringify(system));
      }
      
      setShowReceipt(false);
      setCurrentOrder(null);
      
      toast.success("🔄 Order cancelled, stock restored!");
    }
  };

  if (showReceipt && currentOrder) {
    return (
      <ReceiptPage 
        orderData={currentOrder}
        onBack={() => { 
          setShowReceipt(false); 
          setCurrentOrder(null); 
        }}
        onCancelOrder={handleCancelOrder}
      />
    );
  }

  return (
    <div className="pos-dashboard">
      <div className="pos-card">
        <div className="pos-topbar">
          <select className="customer-select" defaultValue="">
            <option value="" disabled>Walking Customer</option>
            <option value="1">Ali Khan</option>
            <option value="2">Ayesha</option>
          </select>

          <div className="search-group">
            <input
              type="text"
              placeholder="Enter Product Barcode / SKU"
              className="barcode-input"
              value={searchBarcode}
              onChange={(e) => setSearchBarcode(e.target.value)}
              autoFocus
            />
            <input
              type="text"
              placeholder="Search Product Name"
              className="name-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="pos-main">
          <div className="left-section">
            <div className="cart-section">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {carts.length === 0 ? (
                    <tr><td colSpan={5} className="empty-cart">Cart is empty</td></tr>
                  ) : (
                    carts.map(item => (
                      <tr key={item.id}>
                        <td className="item-name">{item.name}</td>
                        <td>
                          <div className="qty-box">
                            <button onClick={() => decreaseQuantity(item.id)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => increaseQuantity(item.id)}>+</button>
                          </div>
                        </td>
                        <td>{fmt(item.price)}</td>
                        <td>{fmt(item.price * item.quantity)}</td>
                        <td>
                          <button className="remove-item" onClick={() => removeFromCart(item.id)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="totals-section">
              <div className="total-line"><span>Sub Total:</span> <strong>{fmt(subtotal)}</strong></div>
              <div className="total-line">
                <span>Discount:</span>
                <input type="number" value={orderDiscount} onChange={e => setOrderDiscount(e.target.value || 0)} />
              </div>
              <div className="total-line checkbox">
                <span>Apply Fractional Discount:</span>
                <input type="checkbox" onChange={e => setOrderDiscount(e.target.checked ? (subtotal % 1).toFixed(2) : 0)} />
              </div>
              <div className="total-line highlight"><span>Total:</span> <strong>{fmt(totalAfterDiscount)}</strong></div>
              <div className="total-line">
                <span>Paid:</span>
                <input type="number" value={paid} onChange={e => setPaid(e.target.value || 0)} />
              </div>
              <div className="total-line highlight">
                <span>{due < 0 ? 'Change' : 'Due'}:</span>
                <strong style={{ color: due < 0 ? '#28a745' : '#dc3545' }}>
                  Rs. {fmt(Math.abs(due))}
                </strong>
              </div>
            </div>

            <div className="action-buttons">
              <button className="clear-cart" onClick={clearCart}>Clear Cart</button>
              <button className="checkout-btn" onClick={handleCheckout}>
                Checkout
              </button>
            </div>
          </div>

          <div className="right-section">
            <div className="products-grid">
              {filteredProducts.length === 0 ? (
                <div className="text-center text-muted p-5">
                  <p>No products found</p>
                  <small>Go to Products → Create Product</small>
                </div>
              ) : (
                filteredProducts.map(prod => {
                  const availableStock = getAvailableStock(prod.id);
                  const isOutOfStock = !prod.unlimited && availableStock === 0;
                  
                  return (
                    <div
                      key={prod.id}
                      className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                      onClick={() => !isOutOfStock && addToCart(prod.id)}
                      style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                    >
                      <img src={prod.image || PLACEHOLDER} alt={prod.name} />
                      <div className="product-info">
                        <p className="product-title">
                          {prod.name} 
                          {prod.unit && <small className="text-muted"> | {prod.unit}</small>}
                        </p>
                        <p className="product-price">Price: Rs.{fmt(prod.price)}</p>
                        <p className="product-stock" style={{ 
                          fontSize: '12px', 
                          fontWeight: 'bold',
                          color: isOutOfStock ? '#dc3545' : availableStock < 5 && !prod.unlimited ? '#ffc107' : '#28a745'
                        }}>
                          {prod.unlimited ? '♾️ Unlimited' : isOutOfStock ? '❌ Out of Stock' : `📦 Stock: ${availableStock}`}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}