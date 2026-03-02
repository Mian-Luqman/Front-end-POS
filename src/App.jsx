// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";

import Login from "./pages/auth/Login";

import Pos from "./pages/Pos";
import ProductsList from "./pages/products/ProductsList";
import CreateProduct from "./pages/products/CreateProduct";
import ProductBrands from "./pages/products/ProductBrands";
import ProductCategories from "./pages/products/ProductCategories";
import CategoryProductsEdit from "./pages/products/CategoryProductsEdit";

import Profile from "./pages/profile/Profile";
import SalesHistory from "./pages/reports/SalesHistory";
import SaleSummary from "./pages/reports/SaleSummary";
import InventoryOverview from "./pages/inventory/InventoryOverview";
import StockAdjustment from "./pages/inventory/StockAdjustment";
import StockHistory from "./pages/inventory/StockHistory";
import LowStockAlerts from "./pages/inventory/LowStockAlerts";

import UserManagement from "./pages/UserManagement";
import StoreManagement from "./pages/StoreManagement";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />


          {/* PROTECTED ROUTES */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Root redirect based on role */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* ADMIN ROUTES (Admin only) */}
            <Route 
              path="/stores" 
              element={
                <RoleGuard allowedRoles={['Admin']}>
                  <StoreManagement />
                </RoleGuard>
              } 
            />

            {/* USER MANAGEMENT (Admin and Manager) */}
            <Route 
              path="/users" 
              element={
                <RoleGuard allowedRoles={['Admin', 'Manager']}>
                  <UserManagement />
                </RoleGuard>
              } 
            />

            {/* POS ROUTES (Cashier only) */}
            <Route 
              path="/pos" 
              element={
                <RoleGuard allowedRoles={['Cashier']}>
                  <Pos />
                </RoleGuard>
              } 
            />

            {/* PRODUCT ROUTES (Manager only) */}
            <Route 
              path="/products" 
              element={
                <RoleGuard allowedRoles={['Manager']}>
                  <ProductsList />
                </RoleGuard>
              } 
            />
            <Route 
              path="/products/create" 
              element={
                <RoleGuard allowedRoles={['Manager']}>
                  <CreateProduct />
                </RoleGuard>
              } 
            />
            <Route 
              path="/products/edit" 
              element={
                <RoleGuard allowedRoles={['Manager']}>
                  <CreateProduct />
                </RoleGuard>
              } 
            />
            <Route 
              path="/products/brands" 
              element={
                <RoleGuard allowedRoles={['Manager']}>
                  <ProductBrands />
                </RoleGuard>
              } 
            />
            <Route 
              path="/products/categories" 
              element={
                <RoleGuard allowedRoles={['Manager']}>
                  <ProductCategories />
                </RoleGuard>
              } 
            />
            <Route
              path="/products/categories/:category/edit-products"
              element={
                <RoleGuard allowedRoles={['Manager']}>
                  <CategoryProductsEdit />
                </RoleGuard>
              }
            />

            {/* INVENTORY ROUTES (Manager only) */}
            <Route 
              path="/inventory" 
              element={
                <RoleGuard allowedRoles={['Manager']}>
                  <InventoryOverview />
                </RoleGuard>
              } 
            />
            <Route 
              path="/inventory/adjust-stock" 
              element={
                <RoleGuard allowedRoles={['Manager']}>
                  <StockAdjustment />
                </RoleGuard>
              } 
            />
            <Route 
              path="/inventory/history" 
              element={
                <RoleGuard allowedRoles={['Manager']}>
                  <StockHistory />
                </RoleGuard>
              } 
            />
            <Route 
              path="/inventory/alerts" 
              element={
                <RoleGuard allowedRoles={['Manager']}>
                  <LowStockAlerts />
                </RoleGuard>
              } 
            />

            {/* REPORTS ROUTES (Manager only) */}
            <Route 
              path="/reports/sales" 
              element={
                <RoleGuard allowedRoles={['Manager']}>
                  <SalesHistory />
                </RoleGuard>
              } 
            />
            <Route 
              path="/reports/summary" 
              element={
                <RoleGuard allowedRoles={['Manager']}>
                  <SaleSummary />
                </RoleGuard>
              } 
            />

            {/* PROFILE PAGE (All roles) */}
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;