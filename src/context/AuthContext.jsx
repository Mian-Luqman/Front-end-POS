// src/context/AuthContext.jsx - Multi-Tenant System
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

// Default Admin User (Sublime Tech)
const DEFAULT_ADMIN = {
  id: 'admin_001',
  name: 'Sublime Tech Admin',
  email: 'admin@sublimetech.com',
  password: 'admin123',
  role: 'Admin',
  storeId: null, // Admin has no store
  image: '',
  createdAt: new Date().toISOString()
};

// Initialize system structure
const initializeSystem = () => {
  const system = localStorage.getItem('pos_system');
  
  if (!system) {
    const initialSystem = {
      admin: DEFAULT_ADMIN,
      stores: []
    };
    localStorage.setItem('pos_system', JSON.stringify(initialSystem));
    return initialSystem;
  }
  
  const parsed = JSON.parse(system);
  
  // Ensure admin exists
  if (!parsed.admin) {
    parsed.admin = DEFAULT_ADMIN;
    localStorage.setItem('pos_system', JSON.stringify(parsed));
  }
  
  return parsed;
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSystem();
    
    const saved = localStorage.getItem("currentUser");
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse currentUser:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setLoading(false);
  }, []);

  // Get system data
  const getSystem = () => {
    return JSON.parse(localStorage.getItem('pos_system'));
  };

  // Save system data
  const saveSystem = (system) => {
    localStorage.setItem('pos_system', JSON.stringify(system));
  };

  // ============ STORE MANAGEMENT ============

  const getAllStores = () => {
    const system = getSystem();
    return system.stores || [];
  };

  const createStore = (storeData) => {
    const system = getSystem();
    
    const newStore = {
      ...storeData,
      id: `store_${Date.now()}`,
      createdAt: new Date().toISOString(),
      users: [],
      products: [],
      orders: [],
      transactions: [],
      customUnits: ['pcs', 'kg', 'gram', 'liter', 'box', 'packet', 'bottle', 'dozen'],
      customCategories: ['Food', 'Medicine', 'Grocery', 'Electronics', 'Clothing'],
      customBrands: ['Generic', 'Local', 'Imported']
    };
    
    system.stores.push(newStore);
    saveSystem(system);
    
    return { success: true, store: newStore };
  };

  const updateStore = (storeId, updatedData) => {
    const system = getSystem();
    
    system.stores = system.stores.map(store =>
      store.id === storeId ? { ...store, ...updatedData } : store
    );
    
    saveSystem(system);
    return { success: true };
  };

  const deleteStore = (storeId) => {
    const system = getSystem();
    
    system.stores = system.stores.filter(store => store.id !== storeId);
    saveSystem(system);
    
    return { success: true };
  };

  const getStoreById = (storeId) => {
    const system = getSystem();
    return system.stores.find(store => store.id === storeId);
  };

  // ============ USER MANAGEMENT ============

  const login = (email, password) => {
    const system = getSystem();
    
    // Check admin
    if (system.admin.email === email && system.admin.password === password) {
      localStorage.setItem("currentUser", JSON.stringify(system.admin));
      setCurrentUser(system.admin);
      return { success: true, role: 'Admin' };
    }
    
    // Check store users
    for (const store of system.stores) {
      const user = store.users.find(u => u.email === email && u.password === password);
      if (user) {
        const userWithStore = { ...user, storeId: store.id };
        localStorage.setItem("currentUser", JSON.stringify(userWithStore));
        setCurrentUser(userWithStore);
        return { success: true, role: user.role };
      }
    }
    
    return { success: false, role: null };
  };

  const getAllUsers = () => {
    if (!currentUser) return [];
    
    const system = getSystem();
    
    if (currentUser.role === 'Admin') {
      // Admin sees all managers from all stores
      const allManagers = [];
      system.stores.forEach(store => {
        const managers = store.users.filter(u => u.role === 'Manager').map(u => ({
          ...u,
          storeId: store.id,
          storeName: store.name
        }));
        allManagers.push(...managers);
      });
      return allManagers;
    }
    
    if (currentUser.role === 'Manager') {
      // Manager sees only cashiers from their store
      const store = getStoreById(currentUser.storeId);
      return store ? store.users.filter(u => u.role === 'Cashier') : [];
    }
    
    return [];
  };

  const register = (userData) => {
    const system = getSystem();
    const { storeId, ...userInfo } = userData;
    
    // Check if email already exists
    for (const store of system.stores) {
      if (store.users.some(u => u.email === userInfo.email)) {
        return { success: false, message: "Email already registered!" };
      }
    }
    
    const store = system.stores.find(s => s.id === storeId);
    if (!store) {
      return { success: false, message: "Store not found!" };
    }
    
    const newUser = {
      ...userInfo,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    store.users.push(newUser);
    saveSystem(system);
    
    return { success: true };
  };

  const updateUser = (userId, updatedData) => {
    const system = getSystem();
    
    for (const store of system.stores) {
      const userIndex = store.users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        store.users[userIndex] = { ...store.users[userIndex], ...updatedData };
        saveSystem(system);
        
        // Update current user if it's them
        if (currentUser && currentUser.id === userId) {
          const updated = { ...store.users[userIndex], storeId: store.id };
          localStorage.setItem("currentUser", JSON.stringify(updated));
          setCurrentUser(updated);
        }
        
        return { success: true };
      }
    }
    
    return { success: false, message: "User not found!" };
  };

  const deleteUser = (userId) => {
    const system = getSystem();
    
    for (const store of system.stores) {
      const initialLength = store.users.length;
      store.users = store.users.filter(u => u.id !== userId);
      
      if (store.users.length < initialLength) {
        saveSystem(system);
        return { success: true };
      }
    }
    
    return { success: false, message: "User not found!" };
  };

  const updateProfile = (updatedData) => {
    if (!currentUser || currentUser.role === 'Admin') return;
    
    const system = getSystem();
    const store = system.stores.find(s => s.id === currentUser.storeId);
    
    if (store) {
      const userIndex = store.users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        store.users[userIndex] = { ...store.users[userIndex], ...updatedData };
        saveSystem(system);
        
        const updatedUser = { ...store.users[userIndex], storeId: store.id };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    getAllStores,
    createStore,
    updateStore,
    deleteStore,
    getStoreById,
    getAllUsers,
    register,
    updateUser,
    deleteUser,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}