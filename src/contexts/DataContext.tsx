import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, SubCategory, MenuItem, Table, Order, OrderItem, ItemRating } from '@/types';
import { useAuth } from "@/contexts/AuthContext";
import axios from 'axios';
import API_BASE_URL from '@/config';

interface DataContextType {
  categories: Category[];
  subCategories: SubCategory[];
  menuItems: MenuItem[];
  tables: Table[];
  orders: Order[];
  ratings: ItemRating[];
  variantChoices: { value: string; label: string }[];
  unitChoices: { value: string; label: string }[];
  currencyChoices: { value: string; label: string }[];
  addCategory: (category: Partial<Category>) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => void;
  addSubCategory: (subCategory: Partial<SubCategory>) => Promise<SubCategory>;
  updateSubCategory: (id: string, subCategory: Partial<SubCategory>) => void;
  deleteSubCategory: (id: string) => void;
  addMenuItem: (menuItem: Partial<MenuItem>) => Promise<MenuItem>;
  updateMenuItem: (id: string, menuItem: Partial<MenuItem>) => Promise<MenuItem>;
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
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ratings, setRatings] = useState<ItemRating[]>([]);

  const [variantChoices, setVariantChoices] = useState<{ value: string; label: string }[]>([]);
  const [unitChoices, setUnitChoices] = useState<{ value: string; label: string }[]>([]);
  const [currencyChoices, setCurrencyChoices] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (isAuthenticated && token) {
      refreshData();
      fetchProductChoices();
    }
  }, [isAuthenticated, token]);

  /* ========================= CATEGORY APIS ========================= */
  const getCategories = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}api/restaurant/main-categories/`, { headers });
      const mappedCategories = data.map((cat: any) => ({
        id: String(cat.id),
        name: cat.name,
        description: cat.description || "",
        isActive: cat.is_active ?? true,
        displayOrder: cat.display_order ?? 0,
        createdAt: cat.created_at || new Date().toISOString(),
      }));
      setCategories(mappedCategories);
    } catch (err: any) {
      console.error("Error fetching categories:", err.message);
    }
  };

  const addCategory = async (category: Partial<Category>): Promise<Category> => {
    const payload = {
      name: category.name,
      description: category.description,
      is_active: category.isActive,
      display_order: category.displayOrder,
    };
    const { data } = await axios.post(`${API_BASE_URL}api/restaurant/main-categories/`, payload, { headers });
    await getCategories();
    return data;
  };

  const updateCategory = async (id: string, category: Partial<Category>): Promise<Category> => {
    const payload = {
      name: category.name,
      description: category.description,
      is_active: category.isActive,
      display_order: category.displayOrder,
    };
    const { data } = await axios.put(`${API_BASE_URL}api/restaurant/main-categories/update/${id}/`, payload, { headers });
    await getCategories();
    return data;
  };

  const deleteCategory = async (id: string) => {
    await axios.delete(`${API_BASE_URL}api/restaurant/main-categories/delete/${id}/`, { headers });
    await getCategories();
  };

  /* ========================= SUB-CATEGORY APIS ========================= */
  const getSubCategories = async () => {
    const { data } = await axios.get(`${API_BASE_URL}api/restaurant/sub-categories/`, { headers });
    setSubCategories(data);
  };

  const addSubCategory = async (sub: Partial<SubCategory>): Promise<SubCategory> => {
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
  };

  const updateSubCategory = async (id: string, sub: Partial<SubCategory>) => {
    const { data } = await axios.put(`${API_BASE_URL}api/restaurant/sub-categories/update/${id}/`, sub, { headers });
    await getSubCategories();
    return data;
  };

  const deleteSubCategory = async (id: string) => {
    await axios.delete(`${API_BASE_URL}api/restaurant/sub-categories/delete/${id}/`, { headers });
    await getSubCategories();
  };

  /* ========================= PRODUCT CHOICES ========================= */
  const fetchProductChoices = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}api/restaurant/product-choices/`, { headers });
      const data = res.data;
      setVariantChoices(data.variant_choices || []);
      setUnitChoices(data.unit_choices || []);
      setCurrencyChoices(data.currency_choices || []);
    } catch (error) {
      console.error("Failed to fetch product choices:", error);
    }
  };

  /* ========================= MENU ITEM APIS ========================= */
  const mapMenuItem = (item: any): MenuItem => {
    const img = item.image_url || "";
    return {
      id: String(item.id ?? ""),
      categoryId: String(item.main_category ?? ""),
      subCategoryId: String(item.sub_category ?? ""),
      name: item.name ?? "",
      description: item.description ?? "",
      price: parseFloat(item.price ?? 0),
      image: img,
      isAvailable: !!item.is_available,
      isActive: !!item.is_active,
      prepTime: item.prepare_time ?? 0,
      isFeatured: !!item.is_featured,
      variantType: item.variant_type || "",
      quantityValue: parseFloat(item.quantity_value ?? 0),
      quantityUnit: item.quantity_unit || "",
      currencySymbol: item.currency_symbol || "$",
      taxPercentage: parseFloat(item.tax_percentage ?? 0),
      stockAvailable: item.stock_available ?? 0,
      maxOrderQuantity: item.max_order_quantity ?? 0,
      displayOrder: item.display_order ?? 0,
      createdAt: item.created_at || "",
      averageRating: parseFloat(item.rating_avg ?? 0),
      totalRatings: item.total_ratings ?? 0,
    };
  };

  const getMenuItems = async () => {
    const { data } = await axios.get(`${API_BASE_URL}api/restaurant/product-items/`, { headers });
    setMenuItems(data.map(mapMenuItem));
  };

  const addMenuItem = async (menuItem: Partial<MenuItem>): Promise<MenuItem> => {
    const payload = {
      main_category: Number(menuItem.categoryId),
      sub_category: menuItem.subCategoryId || null,
      name: menuItem.name,
      description: menuItem.description || "",
      price: menuItem.price ?? 0,
      currency_symbol: menuItem.currencySymbol || "$",
      tax_percentage: menuItem.taxPercentage ?? 0,
      stock_available: menuItem.stockAvailable ?? 0,
      is_available: menuItem.isAvailable ?? true,
      is_active: menuItem.isActive ?? true,
      prepare_time: menuItem.prepTime ?? 0,
      variant_type: menuItem.variantType || "None",
      quantity_value: menuItem.quantityValue ?? 1,
      quantity_unit: menuItem.quantityUnit || "None",
      max_order_quantity: menuItem.maxOrderQuantity ?? null,
      display_order: menuItem.displayOrder ?? 0,
      is_featured: menuItem.isFeatured ?? false,
      image: menuItem.image ?? null,
    };
    const { data } = await axios.post(`${API_BASE_URL}api/restaurant/product-items/`, payload, { headers });
    await getMenuItems();
    return mapMenuItem(data);
  };

  const updateMenuItem = async (id: string, menuItem: Partial<MenuItem>): Promise<MenuItem> => {
    let response;
    const isFileUpload = menuItem.image && typeof menuItem.image !== "string";
    const isImageDeleted = menuItem.image === "" || menuItem.image === null;

    if (isFileUpload || isImageDeleted) {
      const formData = new FormData();
      Object.entries(menuItem).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value as any);
      });
      if (isImageDeleted) {
        formData.delete("image");
        formData.append("image", "");
      }
      response = await axios.put(`${API_BASE_URL}api/restaurant/product-items/update/${id}/`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
    } else {
      const payload = { ...menuItem, main_category: Number(menuItem.categoryId) };
      response = await axios.put(`${API_BASE_URL}api/restaurant/product-items/update/${id}/`, payload, { headers });
    }
    await getMenuItems();
    return mapMenuItem(response.data);
  };

  const deleteMenuItem = async (id: string) => {
    await axios.delete(`${API_BASE_URL}api/restaurant/product-items/delete/${id}/`, { headers });
    await getMenuItems();
  };

  /* ========================= ORDERS, RATINGS, TABLES ========================= */
  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = { ...orderData, id: Date.now().toString(), createdAt: new Date().toISOString() };
    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map(order => order.id === orderId ? { ...order, status } : order);
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const updateOrderItemStatus = (orderId: string, itemId: string, status: OrderItem['status']) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item => item.id === itemId ? { ...item, status } : item);
        return { ...order, items: updatedItems };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const addRating = (ratingData: Omit<ItemRating, 'id' | 'createdAt'>) => {
    const newRating: ItemRating = { ...ratingData, id: Date.now().toString(), createdAt: new Date().toISOString() };
    const updatedRatings = [...ratings, newRating];
    setRatings(updatedRatings);
    localStorage.setItem('ratings', JSON.stringify(updatedRatings));
    updateMenuItemRatings(ratingData.itemId);
  };

  const updateMenuItemRatings = (itemId: string) => {
    const itemRatings = ratings.filter(r => r.itemId === itemId);
    if (itemRatings.length > 0) {
      const average = itemRatings.reduce((sum, r) => sum + r.rating, 0) / itemRatings.length;
      const updatedMenuItems = menuItems.map(item => item.id === itemId ? { ...item, averageRating: average, totalRatings: itemRatings.length } : item);
      setMenuItems(updatedMenuItems);
      localStorage.setItem('menuItems', JSON.stringify(updatedMenuItems));
    }
  };

  const updateTableStatus = (tableId: string, status: Table['status']) => {
    const updatedTables = tables.map(table => table.id === tableId ? { ...table, status } : table);
    setTables(updatedTables);
    localStorage.setItem('tables', JSON.stringify(updatedTables));
  };

  const getMenuItemById = (id: string) => menuItems.find(item => item.id === id);
  const getTableById = (id: string) => tables.find(table => table.id === id);

  const refreshData = async () => {
    await Promise.all([getCategories(), getSubCategories(), getMenuItems()]);
  };

  return (
    <DataContext.Provider value={{
      categories,
      subCategories,
      menuItems,
      tables,
      orders,
      ratings,
      variantChoices,
      unitChoices,
      currencyChoices,
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
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
