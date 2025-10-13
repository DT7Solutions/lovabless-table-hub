import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, MenuItem, Table, Order, OrderItem, ItemRating } from '@/types';

interface DataContextType {
  categories: Category[];
  menuItems: MenuItem[];
  tables: Table[];
  orders: Order[];
  ratings: ItemRating[];
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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ratings, setRatings] = useState<ItemRating[]>([]);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    const storedCategories = localStorage.getItem('categories');
    const storedMenuItems = localStorage.getItem('menuItems');
    const storedTables = localStorage.getItem('tables');
    const storedOrders = localStorage.getItem('orders');
    const storedRatings = localStorage.getItem('ratings');

    if (!storedCategories) {
      const defaultCategories: Category[] = [
        { id: '1', name: 'Appetizers', description: 'Start your meal right', isActive: true, createdAt: new Date().toISOString() },
        { id: '2', name: 'Main Course', description: 'Hearty main dishes', isActive: true, createdAt: new Date().toISOString() },
        { id: '3', name: 'Desserts', description: 'Sweet treats', isActive: true, createdAt: new Date().toISOString() },
        { id: '4', name: 'Beverages', description: 'Refreshing drinks', isActive: true, createdAt: new Date().toISOString() },
      ];
      localStorage.setItem('categories', JSON.stringify(defaultCategories));
      setCategories(defaultCategories);
    } else {
      setCategories(JSON.parse(storedCategories));
    }

    if (!storedMenuItems) {
      const defaultMenuItems: MenuItem[] = [
        { id: '1', categoryId: '1', name: 'Spring Rolls', description: 'Crispy vegetable rolls', price: 120, isAvailable: true, createdAt: new Date().toISOString(), averageRating: 4.5, totalRatings: 12 },
        { id: '2', categoryId: '1', name: 'Paneer Tikka', description: 'Grilled cottage cheese', price: 180, isAvailable: true, createdAt: new Date().toISOString(), averageRating: 4.8, totalRatings: 25 },
        { id: '3', categoryId: '2', name: 'Butter Chicken', description: 'Rich and creamy curry', price: 320, isAvailable: true, createdAt: new Date().toISOString(), averageRating: 4.9, totalRatings: 45 },
        { id: '4', categoryId: '2', name: 'Dal Makhani', description: 'Black lentils in butter gravy', price: 220, isAvailable: true, createdAt: new Date().toISOString(), averageRating: 4.6, totalRatings: 30 },
        { id: '5', categoryId: '3', name: 'Gulab Jamun', description: 'Sweet milk dumplings', price: 80, isAvailable: true, createdAt: new Date().toISOString(), averageRating: 4.7, totalRatings: 18 },
        { id: '6', categoryId: '4', name: 'Mango Lassi', description: 'Yogurt-based mango drink', price: 90, isAvailable: true, createdAt: new Date().toISOString(), averageRating: 4.8, totalRatings: 22 },
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
      menuItems,
      tables,
      orders,
      ratings,
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
