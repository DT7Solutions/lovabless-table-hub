import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, Subcategory, MenuItem, Table, Order, OrderItem, ItemRating } from '@/types';

interface DataContextType {
  categories: Category[];
  subcategories: Subcategory[];
  menuItems: MenuItem[];
  tables: Table[];
  orders: Order[];
  ratings: ItemRating[];
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, category: Partial<Omit<Category, 'id' | 'createdAt'>>) => void;
  deleteCategory: (id: string) => void;
  addSubcategory: (subcategory: Omit<Subcategory, 'id' | 'createdAt'>) => void;
  updateSubcategory: (id: string, subcategory: Partial<Omit<Subcategory, 'id' | 'createdAt'>>) => void;
  deleteSubcategory: (id: string) => void;
  addMenuItem: (menuItem: Omit<MenuItem, 'id' | 'createdAt'>) => void;
  updateMenuItem: (id: string, menuItem: Partial<Omit<MenuItem, 'id' | 'createdAt'>>) => void;
  deleteMenuItem: (id: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderItem['status']) => void;
  addRating: (rating: Omit<ItemRating, 'id' | 'createdAt'>) => void;
  updateTableStatus: (tableId: string, status: Table['status']) => void;
  getMenuItemById: (id: string) => MenuItem | undefined;
  getTableById: (id: string) => Table | undefined;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ratings, setRatings] = useState<ItemRating[]>([]);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    const storedCategories = localStorage.getItem('categories');
    const storedSubcategories = localStorage.getItem('subcategories');
    const storedMenuItems = localStorage.getItem('menuItems');
    const storedTables = localStorage.getItem('tables');
    const storedOrders = localStorage.getItem('orders');
    const storedRatings = localStorage.getItem('ratings');

    if (!storedCategories) {
      const defaultCategories: Category[] = [
        { id: '1', name: 'Appetizers', description: 'Start your meal right', isActive: true, displayOrder: 1, createdAt: new Date().toISOString() },
        { id: '2', name: 'Main Course', description: 'Hearty main dishes', isActive: true, displayOrder: 2, createdAt: new Date().toISOString() },
        { id: '3', name: 'Desserts', description: 'Sweet treats', isActive: true, displayOrder: 3, createdAt: new Date().toISOString() },
        { id: '4', name: 'Beverages', description: 'Refreshing drinks', isActive: true, displayOrder: 4, createdAt: new Date().toISOString() },
      ];
      localStorage.setItem('categories', JSON.stringify(defaultCategories));
      setCategories(defaultCategories);
    } else {
      setCategories(JSON.parse(storedCategories));
    }

    if (!storedSubcategories) {
      const defaultSubcategories: Subcategory[] = [
        { id: '1', categoryId: '2', name: 'Biryani', description: 'Aromatic rice dishes', isActive: true, displayOrder: 1, createdAt: new Date().toISOString() },
        { id: '2', categoryId: '2', name: 'Meals', description: 'Complete meal combos', isActive: true, displayOrder: 2, createdAt: new Date().toISOString() },
        { id: '3', categoryId: '2', name: 'Fried Rice', description: 'Stir-fried rice varieties', isActive: true, displayOrder: 3, createdAt: new Date().toISOString() },
      ];
      localStorage.setItem('subcategories', JSON.stringify(defaultSubcategories));
      setSubcategories(defaultSubcategories);
    } else {
      setSubcategories(JSON.parse(storedSubcategories));
    }

    if (!storedMenuItems) {
      const defaultMenuItems: MenuItem[] = [
        { id: '1', categoryId: '1', name: 'Spring Rolls', description: 'Crispy vegetable rolls', price: 120, isAvailable: true, displayOrder: 1, createdAt: new Date().toISOString(), averageRating: 4.5, totalRatings: 12 },
        { id: '2', categoryId: '1', name: 'Paneer Tikka', description: 'Grilled cottage cheese', price: 180, isAvailable: true, displayOrder: 2, createdAt: new Date().toISOString(), averageRating: 4.8, totalRatings: 25 },
        { id: '3', categoryId: '2', subcategoryId: '1', name: 'Chicken Biryani', description: 'Aromatic basmati rice with chicken', price: 280, isAvailable: true, displayOrder: 1, createdAt: new Date().toISOString(), averageRating: 4.9, totalRatings: 45 },
        { id: '4', categoryId: '2', subcategoryId: '3', name: 'Veg Fried Rice', description: 'Chinese style fried rice', price: 180, isAvailable: true, displayOrder: 1, createdAt: new Date().toISOString(), averageRating: 4.6, totalRatings: 30 },
        { id: '5', categoryId: '3', name: 'Gulab Jamun', description: 'Sweet milk dumplings', price: 80, isAvailable: true, displayOrder: 1, createdAt: new Date().toISOString(), averageRating: 4.7, totalRatings: 18 },
        { id: '6', categoryId: '4', name: 'Mango Lassi', description: 'Yogurt-based mango drink', price: 90, isAvailable: true, displayOrder: 1, createdAt: new Date().toISOString(), averageRating: 4.8, totalRatings: 22 },
      ];
      localStorage.setItem('menuItems', JSON.stringify(defaultMenuItems));
      setMenuItems(defaultMenuItems);
    } else {
      setMenuItems(JSON.parse(storedMenuItems));
    }

    if (!storedTables) {
      const defaultTables: Table[] = [
        { id: '1', tableNumber: '1', seats: 4, status: 'available', location: 'Main Hall', createdAt: new Date().toISOString() },
        { id: '2', tableNumber: '2', seats: 2, status: 'available', location: 'Main Hall', createdAt: new Date().toISOString() },
        { id: '3', tableNumber: '3', seats: 6, status: 'available', location: 'Garden', createdAt: new Date().toISOString() },
        { id: '4', tableNumber: '4', seats: 4, status: 'available', location: 'Garden', createdAt: new Date().toISOString() },
        { id: '5', tableNumber: '5', seats: 8, status: 'available', location: 'Private Room', createdAt: new Date().toISOString() },
      ];
      localStorage.setItem('tables', JSON.stringify(defaultTables));
      setTables(defaultTables);
    } else {
      setTables(JSON.parse(storedTables));
    }

    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }

    if (storedRatings) {
      setRatings(JSON.parse(storedRatings));
    }
  };

  const addCategory = (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  const updateCategory = (id: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt'>>) => {
    const updatedCategories = categories.map(cat =>
      cat.id === id ? { ...cat, ...categoryData } : cat
    );
    setCategories(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  const deleteCategory = (id: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== id);
    setCategories(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  const addSubcategory = (subcategoryData: Omit<Subcategory, 'id' | 'createdAt'>) => {
    const newSubcategory: Subcategory = {
      ...subcategoryData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedSubcategories = [...subcategories, newSubcategory];
    setSubcategories(updatedSubcategories);
    localStorage.setItem('subcategories', JSON.stringify(updatedSubcategories));
  };

  const updateSubcategory = (id: string, subcategoryData: Partial<Omit<Subcategory, 'id' | 'createdAt'>>) => {
    const updatedSubcategories = subcategories.map(sub =>
      sub.id === id ? { ...sub, ...subcategoryData } : sub
    );
    setSubcategories(updatedSubcategories);
    localStorage.setItem('subcategories', JSON.stringify(updatedSubcategories));
  };

  const deleteSubcategory = (id: string) => {
    const updatedSubcategories = subcategories.filter(sub => sub.id !== id);
    setSubcategories(updatedSubcategories);
    localStorage.setItem('subcategories', JSON.stringify(updatedSubcategories));
  };

  const addMenuItem = (menuItemData: Omit<MenuItem, 'id' | 'createdAt'>) => {
    const newMenuItem: MenuItem = {
      ...menuItemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedMenuItems = [...menuItems, newMenuItem];
    setMenuItems(updatedMenuItems);
    localStorage.setItem('menuItems', JSON.stringify(updatedMenuItems));
  };

  const updateMenuItem = (id: string, menuItemData: Partial<Omit<MenuItem, 'id' | 'createdAt'>>) => {
    const updatedMenuItems = menuItems.map(item =>
      item.id === id ? { ...item, ...menuItemData } : item
    );
    setMenuItems(updatedMenuItems);
    localStorage.setItem('menuItems', JSON.stringify(updatedMenuItems));
  };

  const deleteMenuItem = (id: string) => {
    const updatedMenuItems = menuItems.filter(item => item.id !== id);
    setMenuItems(updatedMenuItems);
    localStorage.setItem('menuItems', JSON.stringify(updatedMenuItems));
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const updateOrderItemStatus = (orderId: string, itemId: string, status: OrderItem['status']) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item =>
          item.id === itemId ? { ...item, status } : item
        );
        return { ...order, items: updatedItems };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const addRating = (ratingData: Omit<ItemRating, 'id' | 'createdAt'>) => {
    const newRating: ItemRating = {
      ...ratingData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedRatings = [...ratings, newRating];
    setRatings(updatedRatings);
    localStorage.setItem('ratings', JSON.stringify(updatedRatings));
    
    updateMenuItemRatings(ratingData.itemId);
  };

  const updateMenuItemRatings = (itemId: string) => {
    const itemRatings = ratings.filter(r => r.itemId === itemId);
    if (itemRatings.length > 0) {
      const average = itemRatings.reduce((sum, r) => sum + r.rating, 0) / itemRatings.length;
      const updatedMenuItems = menuItems.map(item =>
        item.id === itemId 
          ? { ...item, averageRating: average, totalRatings: itemRatings.length }
          : item
      );
      setMenuItems(updatedMenuItems);
      localStorage.setItem('menuItems', JSON.stringify(updatedMenuItems));
    }
  };

  const updateTableStatus = (tableId: string, status: Table['status']) => {
    const updatedTables = tables.map(table =>
      table.id === tableId ? { ...table, status } : table
    );
    setTables(updatedTables);
    localStorage.setItem('tables', JSON.stringify(updatedTables));
  };

  const getMenuItemById = (id: string) => menuItems.find(item => item.id === id);
  const getTableById = (id: string) => tables.find(table => table.id === id);

  const refreshData = () => {
    initializeData();
  };

  return (
    <DataContext.Provider value={{
      categories,
      subcategories,
      menuItems,
      tables,
      orders,
      ratings,
      addCategory,
      updateCategory,
      deleteCategory,
      addSubcategory,
      updateSubcategory,
      deleteSubcategory,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      addOrder,
      updateOrderStatus,
      updateOrderItemStatus,
      addRating,
      updateTableStatus,
      getMenuItemById,
      getTableById,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
