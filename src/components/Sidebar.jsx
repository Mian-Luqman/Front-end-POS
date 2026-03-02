// src/components/Sidebar.jsx
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [productOpen, setProductOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);

  const isProductPage = location.pathname.startsWith('/products');
  const isReportsPage = location.pathname.startsWith('/reports');
  const isInventoryPage = location.pathname.startsWith('/inventory');
  const isAdminPage = location.pathname.startsWith('/admin');

  const userRole = currentUser?.role;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        
        {/* ADMIN MENU */}
        {userRole === 'Admin' && (
          <>
            <NavLink
              to="/stores"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-label">🏪 Store Management</span>
            </NavLink>

            <NavLink
              to="/users"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-label">👥 User Management</span>
            </NavLink>
          </>
        )}

        {/* CASHIER MENU */}
        {userRole === 'Cashier' && (
          <NavLink
            to="/pos"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            end
          >
            <span className="nav-label">💰 POS</span>
          </NavLink>
        )}

        {/* MANAGER MENU */}
        {userRole === 'Manager' && (
          <>
            {/* USER MANAGEMENT */}
            <NavLink
              to="/users"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-label">👥 User Management</span>
            </NavLink>

            {/* PRODUCT DROPDOWN */}
            <div className="sb-dropdown-group">
              <div
                className={`nav-item sb-dropdown-header ${isProductPage ? "active open" : ""} ${productOpen || isProductPage ? "open" : ""}`}
                onClick={() => setProductOpen(!productOpen)}
              >
                <span className="nav-label">📦 Product</span>
                <span className={`sb-dropdown-arrow ${productOpen || isProductPage ? "rotated" : ""}`}>▼</span>
              </div>

              {(productOpen || isProductPage) && (
                <div className="sb-dropdown-menu">
                  <NavLink
                    to="/products"
                    className={({ isActive }) => `sb-dropdown-item ${isActive ? "active" : ""}`}
                    end
                  >
                    Product List
                  </NavLink>

                  <NavLink
                    to="/products/create"
                    className={({ isActive }) => `sb-dropdown-item ${isActive ? "active" : ""}`}
                  >
                    Product Create
                  </NavLink>
                  
                  <NavLink 
                    to="/products/brands" 
                    className={({ isActive }) => `sb-dropdown-item ${isActive ? "active" : ""}`}
                  >
                    Product Brands
                  </NavLink>
                  
                  <NavLink 
                    to="/products/categories" 
                    className={({ isActive }) => `sb-dropdown-item ${isActive ? "active" : ""}`}
                  >
                    Product Categories
                  </NavLink>
                </div>
              )}
            </div>

            {/* INVENTORY DROPDOWN */}
            <div className="sb-dropdown-group">
              <div
                className={`nav-item sb-dropdown-header ${isInventoryPage ? "active open" : ""} ${inventoryOpen || isInventoryPage ? "open" : ""}`}
                onClick={() => setInventoryOpen(!inventoryOpen)}
              >
                <span className="nav-label">📊 Inventory</span>
                <span className={`sb-dropdown-arrow ${inventoryOpen || isInventoryPage ? "rotated" : ""}`}>▼</span>
              </div>

              {(inventoryOpen || isInventoryPage) && (
                <div className="sb-dropdown-menu">
                  <NavLink
                    to="/inventory"
                    className={({ isActive }) => `sb-dropdown-item ${isActive ? "active" : ""}`}
                    end
                  >
                    Inventory Overview
                  </NavLink>

                  <NavLink
                    to="/inventory/adjust-stock"
                    className={({ isActive }) => `sb-dropdown-item ${isActive ? "active" : ""}`}
                  >
                    Adjust Stock
                  </NavLink>

                  <NavLink
                    to="/inventory/history"
                    className={({ isActive }) => `sb-dropdown-item ${isActive ? "active" : ""}`}
                  >
                    Stock History
                  </NavLink>

                  <NavLink
                    to="/inventory/alerts"
                    className={({ isActive }) => `sb-dropdown-item ${isActive ? "active" : ""}`}
                  >
                    Low Stock Alerts
                  </NavLink>
                </div>
              )}
            </div>

            {/* REPORTS DROPDOWN */}
            <div className="sb-dropdown-group">
              <div
                className={`nav-item sb-dropdown-header ${isReportsPage ? "active open" : ""} ${reportsOpen || isReportsPage ? "open" : ""}`}
                onClick={() => setReportsOpen(!reportsOpen)}
              >
                <span className="nav-label">📈 Reports</span>
                <span className={`sb-dropdown-arrow ${reportsOpen || isReportsPage ? "rotated" : ""}`}>▼</span>
              </div>

              {(reportsOpen || isReportsPage) && (
                <div className="sb-dropdown-menu">
                  <NavLink
                    to="/reports/sales"
                    className={({ isActive }) => `sb-dropdown-item ${isActive ? "active" : ""}`}
                  >
                    Sales History
                  </NavLink>
                  
                  <NavLink
                    to="/reports/summary"
                    className={({ isActive }) => `sb-dropdown-item ${isActive ? "active" : ""}`}
                  >
                    Sale Summary
                  </NavLink>
                </div>
              )}
            </div>
          </>
        )}

      </nav>
    </aside>
  );
}