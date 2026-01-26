// src/components/Header.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import useLocalStorageProducts from "../hooks/useLocalStorageProducts";

export default function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { products } = useLocalStorageProducts();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [seenProductIds, setSeenProductIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Load seen notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('seenLowStockNotifications');
    if (saved) {
      setSeenProductIds(JSON.parse(saved));
    }
  }, []);

  // Listen for localStorage changes (real-time sync across components)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'pos_products' || e.type === 'pos_products_updated') {
        setRefreshKey(prev => prev + 1);
      }
    };

    // Listen to custom event for same-tab updates
    window.addEventListener('pos_products_updated', handleStorageChange);
    
    // Listen to storage event for cross-tab updates
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('pos_products_updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Low stock calculation (real-time with refreshKey dependency)
  const lowStockProducts = products
    .filter((p) => !p.unlimited && p.quantity > 0 && p.quantity < 5)
    .slice(0, 5);

  const allLowStockProducts = products.filter(
    (p) => !p.unlimited && p.quantity > 0 && p.quantity < 5
  );

  const lowStockCount = allLowStockProducts.length;

  // Check for new unseen notifications (real-time)
  useEffect(() => {
    const currentLowStockIds = allLowStockProducts.map(p => p.id);
    
    // Clean up seen list - remove products that are no longer low stock
    const healthyProducts = products.filter(p => !p.unlimited && p.quantity >= 5).map(p => p.id);
    const cleanedSeenIds = seenProductIds.filter(id => !healthyProducts.includes(id));
    
    // Update localStorage if cleaned
    if (cleanedSeenIds.length !== seenProductIds.length) {
      setSeenProductIds(cleanedSeenIds);
      localStorage.setItem('seenLowStockNotifications', JSON.stringify(cleanedSeenIds));
    }
    
    const hasUnseen = currentLowStockIds.some(id => !cleanedSeenIds.includes(id));
    setHasNewNotifications(hasUnseen && lowStockCount > 0);
  }, [products, seenProductIds, lowStockCount, refreshKey]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    setNotifOpen(false);
  };

  const toggleNotification = () => {
    const newNotifState = !notifOpen;
    setNotifOpen(newNotifState);
    setDropdownOpen(false);

    // Mark all current low stock products as seen when opening notification
    if (newNotifState && lowStockCount > 0) {
      const currentLowStockIds = allLowStockProducts.map(p => p.id);
      const updatedSeen = [...new Set([...seenProductIds, ...currentLowStockIds])];
      setSeenProductIds(updatedSeen);
      localStorage.setItem('seenLowStockNotifications', JSON.stringify(updatedSeen));
      setHasNewNotifications(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="d-flex justify-content-between align-items-center p-3 bg-light shadow-sm">
      <h4 className="m-0">POS System</h4>

      <div className="d-flex align-items-center gap-3 me-4">

        {/* NOTIFICATION DROPDOWN */}
        <div className="position-relative" ref={notifRef}>
          <button
            className="btn btn-light position-relative rounded-circle"
            onClick={toggleNotification}
          >
            🔔
            {hasNewNotifications && (
              <span className="position-absolute top-0 start-100 translate-middle badge bg-danger rounded-pill">
                {lowStockCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="position-absolute end-0 mt-2 bg-white border rounded shadow p-0"
              style={{ width: "320px", zIndex: 2000 }}
            >
              <div className="p-3 border-bottom fw-semibold">
                📦 Low Stock Alerts
              </div>

              {lowStockProducts.length === 0 ? (
                <div className="text-center p-4 text-secondary">
                  <div style={{ fontSize: "40px" }}>✅</div>
                  All stock levels are healthy!
                </div>
              ) : (
                <>
                  {lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="d-flex align-items-center p-2 border-bottom"
                    >
                      <img
                        src={product.image || "https://via.placeholder.com/40"}
                        alt={product.name}
                        className="rounded me-2"
                        width="40"
                        height="40"
                      />
                      <div>
                        <div className="fw-semibold">{product.name}</div>
                        <div className="text-danger small">
                          ⚠️ Only {product.quantity} left
                        </div>
                      </div>
                    </div>
                  ))}

                  {lowStockCount > 5 && (
                    <div className="text-center py-2 text-secondary small border-bottom">
                      + {lowStockCount - 5} more items
                    </div>
                  )}

                  <div className="p-2">
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => {
                        setNotifOpen(false);
                        navigate("/inventory/alerts");
                      }}
                    >
                      View All Alerts →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* USER DROPDOWN */}
        <div className="dropdown" ref={dropdownRef}>
          <div
            className="d-flex align-items-center dropdown-toggle me-5"
            style={{ cursor: "pointer" }}
            onClick={toggleDropdown}
          >
            <img
              src={currentUser?.image || "/default-avatar.png"}
              alt="User"
              width="40"
              height="40"
              className="rounded-circle me-2"
              style={{ objectFit: "cover" }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/40";
              }}
            />
            <span>{currentUser?.name}</span>
          </div>

          {dropdownOpen && (
            <ul className="dropdown-menu dropdown-menu-end show mt-2">
              <li>
                <Link
                  className="dropdown-item"
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                >
                  👤 My Profile
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}