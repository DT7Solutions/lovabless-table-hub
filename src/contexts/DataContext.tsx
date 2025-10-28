import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, SubCategory, MenuItem, Table, Order, OrderItem, ItemRating } from '@/types';
import axios from 'axios';
import API_BASE_URL from '@/config';

const token = localStorage.getItem("accessToken");
const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}`, };

interface DataContextType {
  categories: Category[];
  subCategories: SubCategory[];
  menuItems: MenuItem[];
  tables: Table[];
  orders: Order[];
  ratings: ItemRating[];
  addCategory: (category: Partial<Category>) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => void;
  addSubCategory: (subCategory: Partial<SubCategory>) => Promise<SubCategory>;
  updateSubCategory: (id: string, subCategory: Partial<SubCategory>) => Promise<SubCategory>;
  deleteSubCategory: (id: string) => void;
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
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ratings, setRatings] = useState<ItemRating[]>([]);

  useEffect(() => {
    getCategories();
    getSubCategories();

    initializeData();
    refreshData();
  }, []);

  const initializeData = () => {
    const storedCategories = categories ;
    const storedSubCategories = subCategories;
    const storedMenuItems = localStorage.getItem('menuItems');
    const storedTables = localStorage.getItem('tables');
    const storedOrders = localStorage.getItem('orders');
    const storedRatings = localStorage.getItem('ratings');

    // if (!storedCategories) {
    //   const defaultCategories: Category[] = [
    //     { id: '1', name: 'Appetizers', description: 'Start your meal right', isActive: true, displayOrder: 1, createdAt: new Date().toISOString() },
    //     { id: '2', name: 'Main Course', description: 'Hearty main dishes', isActive: true, displayOrder: 2, createdAt: new Date().toISOString() },
    //     { id: '3', name: 'Desserts', description: 'Sweet treats', isActive: true, displayOrder: 3, createdAt: new Date().toISOString() },
    //     { id: '4', name: 'Beverages', description: 'Refreshing drinks', isActive: true, displayOrder: 4, createdAt: new Date().toISOString() },
    //   ];
    //   localStorage.setItem('categories', JSON.stringify(defaultCategories));
    //   setCategories(defaultCategories);
    // } else {
    //   setCategories(JSON.parse(storedCategories));
    // }

    // if (!storedSubCategories) {
    //   const defaultSubCategories: SubCategory[] = [
    //     { id: '1', categoryId: '1', name: 'Veg Starters', description: 'Vegetarian appetizers', isActive: true, displayOrder: 1, createdAt: new Date().toISOString() },
    //     { id: '2', categoryId: '1', name: 'Non-Veg Starters', description: 'Non-vegetarian appetizers', isActive: true, displayOrder: 2, createdAt: new Date().toISOString() },
    //     { id: '3', categoryId: '2', name: 'Biryani', description: 'Rice dishes', isActive: true, displayOrder: 1, createdAt: new Date().toISOString() },
    //     { id: '4', categoryId: '2', name: 'Curries', description: 'Gravy dishes', isActive: true, displayOrder: 2, createdAt: new Date().toISOString() },
    //   ];
    //   localStorage.setItem('subCategories', JSON.stringify(defaultSubCategories));
    //   setSubCategories(defaultSubCategories);
    // } else {
    //   setSubCategories(JSON.parse(storedSubCategories));
    // }

    if (!storedMenuItems) {
      const defaultMenuItems: MenuItem[] = [
        { id: '1', categoryId: '1', subCategoryId: '1', name: 'Spring Rolls', description: 'Crispy vegetable rolls', price: 120, isAvailable: true, isActive: true, displayOrder: 1, currencySymbol: '₹', quantityUnit: 'plate', stockAvailable: 50, createdAt: new Date().toISOString(), averageRating: 4.5, totalRatings: 12 },
        { id: '2', categoryId: '1', subCategoryId: '1', name: 'Paneer Tikka', description: 'Grilled cottage cheese', price: 180, isAvailable: true, isActive: true, displayOrder: 2, currencySymbol: '₹', quantityUnit: 'plate', stockAvailable: 40, createdAt: new Date().toISOString(), averageRating: 4.8, totalRatings: 25 },
        { id: '3', categoryId: '2', subCategoryId: '4', name: 'Butter Chicken', description: 'Rich and creamy curry', price: 320, isAvailable: true, isActive: true, displayOrder: 1, currencySymbol: '₹', quantityUnit: 'plate', stockAvailable: 30, createdAt: new Date().toISOString(), averageRating: 4.9, totalRatings: 45 },
        { id: '4', categoryId: '2', subCategoryId: '4', name: 'Dal Makhani', description: 'Black lentils in butter gravy', price: 220, isAvailable: true, isActive: true, displayOrder: 2, currencySymbol: '₹', quantityUnit: 'plate', stockAvailable: 45, createdAt: new Date().toISOString(), averageRating: 4.6, totalRatings: 30 },
        { id: '5', categoryId: '3', name: 'Gulab Jamun', description: 'Sweet milk dumplings', price: 80, isAvailable: true, isActive: true, displayOrder: 1, currencySymbol: '₹', quantityUnit: 'plate', stockAvailable: 60, createdAt: new Date().toISOString(), averageRating: 4.7, totalRatings: 18 },
        { id: '6', categoryId: '4', name: 'Mango Lassi', description: 'Yogurt-based mango drink', price: 90, isAvailable: true, isActive: true, displayOrder: 1, currencySymbol: '₹', quantityUnit: 'litre', stockAvailable: 25, createdAt: new Date().toISOString(), averageRating: 4.8, totalRatings: 22 },
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
  
  /* ========================= GET ALL CATEGORIES (GET) ========================= */
  const getCategories = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}api/restaurant/main-categories/`, { headers });
      setCategories(data);
      // console.log("✅ Categories loaded:", data);
    } catch (err: any) {
      console.error("❌ Error fetching categories:", err.message);
    }
  };

  /* ========================= ADD CATEGORY (POST) ========================= */
  const addCategory = async (category: Partial<Category>): Promise<Category> => {
    try {
      const payload = {
        name: category.name,
        description: category.description || "",
        is_active: category.isActive ?? true,
        display_order: category.displayOrder ?? 1,
      };
      const { data } = await axios.post(`${API_BASE_URL}api/restaurant/main-categories/`, payload, { headers });
      await getCategories();
      return data;
      // console.log("✅ Category added:", data);
    } catch (err: any) {
      console.error("❌ Error adding category:", err.message);
      throw err;
    }
  };

  /* ========================= UPDATE CATEGORY (PUT) ========================= */
  const updateCategory = async (id: string, category: Partial<Category>): Promise<Category> => {
    try {
      const { data } = await axios.put(`${API_BASE_URL}api/restaurant/main-categories/update/${id}/`, category, { headers });
      await getCategories();
      return data;
      // console.log("✅ Category updated:", data);
    } catch (err: any) {
      console.error("❌ Error updating category:", err.message);
    }
  };

  /* ========================= DELETE CATEGORY (DELETE) ========================= */
  const deleteCategory = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}api/restaurant/main-categories/delete/${id}/`, { headers });
      await getCategories();
      // console.log("✅ Category deleted:", id);
    } catch (err: any) {
      console.error("❌ Error deleting category:", err.message);
    }
  };

  /* ========================= GET ALL SUB-CATEGORIES (GET) ========================= */
  const getSubCategories = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}api/restaurant/sub-categories/`, { headers });
      setSubCategories(data);
      // console.log("✅ Subcategories loaded:", data);
    } catch (err: any) {
      console.error("❌ Error fetching subcategories:", err.message);
    }
  };

  /* ========================= ADD SUB-CATEGORY (POST) ========================= */
  const addSubCategory = async (sub: Partial<SubCategory>): Promise<SubCategory> => {
    try {
      const payload = {
        name: sub.name,
        description: sub.description || "",
        is_active: sub.isActive ?? true,
        display_order: sub.displayOrder ?? 1,
        main_category: Number(sub.categoryId),
      };
      const { data } = await axios.post(`${API_BASE_URL}api/restaurant/sub-categories/`, payload, { headers });
      await getSubCategories();
      return data;
      // console.log("✅ Subcategory added:", data);
    } catch (err: any) {
      console.error("❌ Error adding subcategory:", err.message);
    }
  };

  /* ========================= UPDATE SUB-CATEGORY (PUT) ========================= */
  const updateSubCategory = async (id: string, sub: Partial<SubCategory>) => {
    try {
      const { data } = await axios.put(`${API_BASE_URL}api/restaurant/sub-categories/update/${id}/`, sub, { headers });
      await getSubCategories();
      return data;
      // console.log("✅ Subcategory updated:", data);
    } catch (err: any) {
      console.error("❌ Error updating subcategory:", err.message);
    }
  };

  /* ========================= DELETE SUB-CATEGORY (DELETE) ========================= */
  const deleteSubCategory = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}api/restaurant/sub-categories/delete/${id}/`, { headers });
      await getSubCategories();
      // console.log("✅ Subcategory deleted:", id);
    } catch (err: any) {
      console.error("❌ Error deleting subcategory:", err.message);
    }
  };

  const addMenuItem = async () => {
    try {
      if (!token) throw new Error("User not authenticated");

      // const menuItemData = {
      //   main_category_id: 1,
      //   sub_category_id: 1,
      //   name: newName,
      //   slug: newName.toLowerCase().replace(/\s+/g, "-"),
      //   description: "Special Biriyani",
      //   prepare_time: 10,
      //   variant_type: "Veg",
      //   quantity_value: 1,
      //   quantity_unit: "item",
      //   price: 100.0,
      //   currency_symbol: "$",
      //   tax_percentage: 0.0,
      //   stock_available: 0,
      //   is_available: true,
      //   is_active: true,
      //   max_order_quantity: 5,
      //   customizations: "",
      //   offers: [], 
      // };

      const productItem = {
        id: 1,
        main_category: 1,
        sub_category: 1,
        created_by: 6,
        offers_details: 1,
        name: "Chiken Biryani",
        slug: "veg-biryani",
        description: "Non Veg Biriyani",
        prepare_time: 30,
        variant_type: "Non-Veg",
        quantity_value: 1,
        quantity_unit: "item",
        price: "200.00",
        currency_symbol: "$",
        tax_percentage: "0.00",
        stock_available: 0,
        is_available: true,
        is_active: true,
        max_order_quantity: 10,
        customizations: "",
        rating_avg: "0.0",
        created_at: "2025-10-24T06:46:42.831916Z",
        updated_at: "2025-10-24T06:46:42.846894Z"
      };

      const response = await axios.post(
        `${API_BASE_URL}api/restaurant/product-items/`,
        productItem,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Menu item added successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error adding menu item:", error.message);
      throw error;
    }
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

  /* ========================= REFRESH DATA (Reload all data from server) ========================= */
  const refreshData = async () => {
    try {
      await Promise.all([getCategories(), getSubCategories()]);
      // console.log("🔄 Data refreshed successfully");
    } catch (error: any) {
      console.error("❌ Error refreshing data:", error.message);
    }
  };

  return (
    <DataContext.Provider value={{
      categories,
      subCategories,
      menuItems,
      tables,
      orders,
      ratings,
      addCategory,
      updateCategory,
      deleteCategory,
      addSubCategory,
      updateSubCategory,
      deleteSubCategory,
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
