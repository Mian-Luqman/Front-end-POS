// src/hooks/useLocalStorageProducts.js - Multi-Tenant Version
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function useLocalStorageProducts() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);

  // Load products for current user's store
  const loadProducts = () => {
    if (!currentUser || !currentUser.storeId) {
      setProducts([]);
      return;
    }

    const system = JSON.parse(localStorage.getItem('pos_system'));
    if (!system) return;

    const store = system.stores.find(s => s.id === currentUser.storeId);
    if (store) {
      setProducts(store.products || []);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [currentUser]);

  // Listen for custom storage events (real-time sync)
  useEffect(() => {
    const handleStorageChange = () => {
      loadProducts();
    };

    window.addEventListener('pos_products_updated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('pos_products_updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser]);

  // Save products to store
  const saveProducts = (newProducts) => {
    if (!currentUser || !currentUser.storeId) return;

    const system = JSON.parse(localStorage.getItem('pos_system'));
    if (!system) return;

    const storeIndex = system.stores.findIndex(s => s.id === currentUser.storeId);
    if (storeIndex !== -1) {
      system.stores[storeIndex].products = newProducts;
      localStorage.setItem('pos_system', JSON.stringify(system));
      setProducts(newProducts);
      
      // Dispatch custom event to notify all components
      window.dispatchEvent(new Event('pos_products_updated'));
    }
  };

  const addProduct = (product) => {
    const newProduct = { 
      ...product, 
      id: Date.now(), 
      createdAt: new Date().toISOString(),
      storeId: currentUser.storeId 
    };
    saveProducts([...products, newProduct]);
  };

  const updateProduct = (id, updatedProduct) => {
    saveProducts(products.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
  };

  const deleteProduct = (id) => {
    saveProducts(products.filter(p => p.id !== id));
  };

  return { products, addProduct, updateProduct, deleteProduct, saveProducts };
}