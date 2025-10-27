import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, SubCategory, MenuItem, Table, Order, OrderItem, ItemRating } from '@/types';
import axios from 'axios';
import API_BASE_URL from '@/config';

const token = localStorage.getItem("accessToken");
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

interface DataContextType {
  categories: Category[];
  subCategories: SubCategory[];
  menuItems: MenuItem[];
  tables: Table[];
  orders: Order[];
  ratings: ItemRating[];
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Omit<Category, 'id' | 'createdAt'>>) => Promise<Category>;
  deleteCategory: (id: string) => void;
  addSubCategory: (subCategory: Omit<SubCategory, 'id' | 'createdAt'>) => void;
  updateSubCategory: (id: string, subCategory: Partial<Omit<SubCategory, 'id' | 'createdAt'>>) => void;
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
    // const getCategories = async () => {
    //   try {
    //     const response = await axios.get(
    //       `${API_BASE_URL}api/restaurant/main-categories/`,
    //       { headers }
    //     );
    //     console.log("📦 Categories fetched:", response.data);

    //     setCategories(response.data);
    //     localStorage.setItem("categories", JSON.stringify(response.data));
    //   } catch (error: any) {
    //     console.error(
    //       "❌ Error fetching categories:",error.response?.data || error.message
    //     );
    //     const storedCategories = localStorage.getItem("categories");
    //     if (storedCategories) {
    //       setCategories(JSON.parse(storedCategories));
    //     } else {
    //       setCategories([]);
    //     }
    //   }
    // };
    getCategories();
    getSubCategories();

    initializeData();
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
      const response = await axios.get(
        `${API_BASE_URL}api/restaurant/main-categories/`,
        { headers }
      );

      setCategories(response.data);
      localStorage.setItem('categories', JSON.stringify(response.data));
    } catch (error: any) {
      console.error("❌ Error fetching categories:", error.response?.data || error.message);

      const storedCategories = localStorage.getItem('categories');
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories([]);
      }
    }
  };

  /* ========================= ADD CATEGORY (POST) ========================= */
  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
    try {
      if (!token) throw new Error("User not authenticated");

      const payload = {
        name: categoryData.name,
        description: categoryData.description || "",
        is_active: categoryData.isActive ?? true,
        display_order: categoryData.displayOrder ?? 1,
      };

      const response = await axios.post(
        `${API_BASE_URL}api/restaurant/main-categories/`,
        payload,
        { headers }
      );

      const newCategory = response.data;
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));

      return newCategory;
    } catch (error: any) {
      console.error("❌ Error adding category:", error.response?.data || error.message);
      throw error;
    }
  };

  /* ========================= UPDATE CATEGORY (PUT) ========================= */
  const updateCategory = async ( id: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt'>>) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}api/restaurant/main-categories/update/${id}/`,
        categoryData,
        { headers }
      );

      const updatedCategory = response.data;
      const updatedCategories = categories.map(cat =>
        cat.id === id ? updatedCategory : cat
      );
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));

      return updatedCategory;
    } catch (error: any) {
      console.error("❌ Error updating category:", error.response?.data || error.message);
      throw error;
    }
  };

  /* ========================= DELETE CATEGORY (DELETE) ========================= */
  const deleteCategory = async (id: string) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}api/restaurant/main-categories/delete/${id}/`,
        { headers }
      );

      const updatedCategories = categories.filter(cat => cat.id !== id);
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));

      return true;
    } catch (error: any) {
      console.error("❌ Error deleting category:", error.response?.data || error.message);
      throw error;
    }
  };

  /* ========================= GET ALL SUB-CATEGORIES (GET) ========================= */
  const getSubCategories = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}api/restaurant/sub-categories/`,
        { headers }
      );

      setSubCategories(response.data);
      localStorage.setItem('subCategories', JSON.stringify(response.data));
    } catch (error: any) {
      console.error("❌ Error fetching sub-categories:", error.response?.data || error.message);

      const storedSubCategories = localStorage.getItem('subCategories');
      if (storedSubCategories) {
        setSubCategories(JSON.parse(storedSubCategories));
      } else {
        setSubCategories([]);
      }
    }
  };

  /* ========================= ADD SUB-CATEGORY (POST) ========================= */
  const addSubCategory = async (subCategoryData: Omit<SubCategory, 'id' | 'createdAt'>) => {
    try {
      if (!token) throw new Error("User not authenticated");
      const payload = {
        name: subCategoryData.name,
        description: subCategoryData.description || "",
        is_active: subCategoryData.isActive ?? true,
        display_order: subCategoryData.displayOrder ?? 1,
        main_category: Number(subCategoryData.categoryId)
      };
      const response = await axios.post(
        `${API_BASE_URL}api/restaurant/sub-categories/`,
        payload,
        { headers }
      );
      const newSubCategory = response.data;
      const updatedSubCategories = [...subCategories, newSubCategory];
      setSubCategories(updatedSubCategories);
      localStorage.setItem('subCategories', JSON.stringify(updatedSubCategories));

      return newSubCategory;
    } catch (error: any) {
      console.error("❌ Error adding sub-category:", error.response?.data || error.message);
      throw error;
    }
  };

  /* ========================= UPDATE SUB-CATEGORY (PUT) ========================= */
  const updateSubCategory = async (
    id: string,
    subCategoryData: Partial<Omit<SubCategory, 'id' | 'createdAt'>>
  ) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}api/restaurant/sub-categories/update/${id}/`,
        subCategoryData,
        { headers }
      );

      const updatedSubCategory = response.data;
      const updatedSubCategories = subCategories.map(sub =>
        sub.id === id ? updatedSubCategory : sub
      );
      setSubCategories(updatedSubCategories);
      localStorage.setItem('subCategories', JSON.stringify(updatedSubCategories));

      return updatedSubCategory;
    } catch (error: any) {
      console.error("❌ Error updating sub-category:", error.response?.data || error.message);
      throw error;
    }
  };

  /* ========================= DELETE SUB-CATEGORY (DELETE) ========================= */
  const deleteSubCategory = async (id: string) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}api/restaurant/sub-categories/delete/${id}/`,
        { headers }
      );

      const updatedSubCategories = subCategories.filter(sub => sub.id !== id);
      setSubCategories(updatedSubCategories);
      localStorage.setItem('subCategories', JSON.stringify(updatedSubCategories));
      return true;
    } catch (error: any) {
      console.error("❌ Error deleting sub-category:", error.response?.data || error.message);
      throw error;
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

  const refreshData = async () => {
    try {
      await Promise.all([
        getCategories(),
        getSubCategories(),
        // getMenuItems(),
      ]);
      console.log("✅ Data refreshed successfully");
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
