export type UserRole = 'customer' | 'waiter' | 'chef' | 'admin';

export type OrderStatus = 'pending' | 'in_progress' | 'ready' | 'served' | 'cancelled';
export type OrderItemStatus = 'pending' | 'in_progress' | 'ready';
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';
export type ReservationStatus = 'confirmed' | 'cancelled' | 'completed';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'wallet';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  username: string;
  role: UserRole;
  profileImage?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  createdAt: string;
  averageRating?: number;
  totalRatings?: number;
}

export interface ItemCustomization {
  id: string;
  itemId: string;
  name: string;
  extraPrice: number;
}

export interface Table {
  id: string;
  tableNumber: string;
  seats: number;
  status: TableStatus;
  location: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  customerId: string;
  tableId: string;
  date: string;
  time: string;
  guests: number;
  status: ReservationStatus;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemId: string;
  quantity: number;
  status: OrderItemStatus;
  customizations: string[];
  createdAt: string;
}

export interface Order {
  id: string;
  tableId: string;
  waiterId: string;
  customerId: string;
  status: OrderStatus;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface Bill {
  id: string;
  orderId: string;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  currency: string;
  paid: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  billId: string;
  method: PaymentMethod;
  amount: number;
  timestamp: string;
}

export interface ItemRating {
  id: string;
  orderItemId: string;
  customerId: string;
  itemId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}
