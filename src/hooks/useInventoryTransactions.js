// src/hooks/useInventoryTransactions.js - Multi-Tenant Version
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function useInventoryTransactions() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);

  // Load transactions for current user's store
  const loadTransactions = () => {
    if (!currentUser || !currentUser.storeId) {
      setTransactions([]);
      return;
    }

    const system = JSON.parse(localStorage.getItem('pos_system'));
    if (!system) return;

    const store = system.stores.find(s => s.id === currentUser.storeId);
    if (store) {
      setTransactions(store.transactions || []);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [currentUser]);

  // Save transactions to store
  const saveTransactions = (newTransactions) => {
    if (!currentUser || !currentUser.storeId) return;

    const system = JSON.parse(localStorage.getItem('pos_system'));
    if (!system) return;

    const storeIndex = system.stores.findIndex(s => s.id === currentUser.storeId);
    if (storeIndex !== -1) {
      system.stores[storeIndex].transactions = newTransactions;
      localStorage.setItem('pos_system', JSON.stringify(system));
      setTransactions(newTransactions);
    }
  };

  // Add new transaction (latest first)
  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      changedBy: currentUser?.name || 'Unknown',
      storeId: currentUser?.storeId
    };
    
    saveTransactions([newTransaction, ...transactions]);
    return newTransaction;
  };

  // Get transactions for specific product
  const getProductTransactions = (productId) => {
    return transactions.filter(t => t.productId === productId);
  };

  // Get recent transactions (limit)
  const getRecentTransactions = (limit = 10) => {
    return transactions.slice(0, limit);
  };

  // Clear all transactions (for testing/reset)
  const clearTransactions = () => {
    saveTransactions([]);
  };

  return {
    transactions,
    addTransaction,
    getProductTransactions,
    getRecentTransactions,
    clearTransactions,
    saveTransactions
  };
}