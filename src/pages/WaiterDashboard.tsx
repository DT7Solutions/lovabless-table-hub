import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Plus, Minus, ShoppingCart, Check, X, Receipt, Bell } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Table, OrderItem, MenuItem } from '@/types';

export default function WaiterDashboard() {
  const { user, logout } = useAuth();
  const { tables, menuItems, orders, categories, addOrder, updateOrderItemStatus, updateTableStatus, getMenuItemById } = useData();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderCart, setOrderCart] = useState<{ item: MenuItem; quantity: number; customization: string; cookingInstructions: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemCustomizations, setItemCustomizations] = useState<string[]>([]);
  const [itemCookingInstructions, setItemCookingInstructions] = useState('');

  // Get active order for selected table
  const activeOrder = orders.find(o => o.tableId === selectedTable?.id && o.status !== 'served' && o.status !== 'cancelled');

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.isAvailable;
  });

  // Get order history for table
  const tableOrders = orders.filter(o => o.tableId === selectedTable?.id);

  const handleAssignTable = () => {
    if (!selectedTable || !customerName) {
      toast({ title: "Error", description: "Please enter customer name", variant: "destructive" });
      return;
    }
    updateTableStatus(selectedTable.id, 'occupied');
    setShowAssignDialog(false);
    toast({ title: "Success", description: `Table ${selectedTable.tableNumber} assigned` });
  };

  const openItemDetails = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setItemQuantity(1);
    setItemCustomizations([]);
    setItemCookingInstructions('');
  };

  const addItemToCart = () => {
    if (!selectedMenuItem) return;
    
    const customization = itemCustomizations.join(', ');
    const existing = orderCart.find(c => 
      c.item.id === selectedMenuItem.id && 
      c.customization === customization && 
      c.cookingInstructions === itemCookingInstructions
    );
    
    if (existing) {
      setOrderCart(orderCart.map(c => 
        c.item.id === selectedMenuItem.id && 
        c.customization === customization && 
        c.cookingInstructions === itemCookingInstructions
          ? { ...c, quantity: c.quantity + itemQuantity }
          : c
      ));
    } else {
      setOrderCart([...orderCart, { 
        item: selectedMenuItem, 
        quantity: itemQuantity, 
        customization,
        cookingInstructions: itemCookingInstructions 
      }]);
    }
    
    setSelectedMenuItem(null);
    toast({ title: "Success", description: `${selectedMenuItem.name} added to cart` });
  };

  const toggleCustomization = (option: string) => {
    setItemCustomizations(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const updateQuantity = (index: number, delta: number) => {
    setOrderCart(orderCart.map((c, idx) => {
      if (idx === index) {
        const newQty = c.quantity + delta;
        return newQty > 0 ? { ...c, quantity: newQty } : c;
      }
      return c;
    }).filter(c => c.quantity > 0));
  };

  const removeFromCart = (index: number) => {
    setOrderCart(orderCart.filter((_, idx) => idx !== index));
  };

  const submitOrder = () => {
    if (!selectedTable || orderCart.length === 0) {
      toast({ title: "Error", description: "Cart is empty", variant: "destructive" });
      return;
    }

    const orderItems: OrderItem[] = orderCart.map(c => ({
      id: Math.random().toString(36).substr(2, 9),
      orderId: '',
      itemId: c.item.id,
      quantity: c.quantity,
      status: 'pending',
      customizations: [
        ...(c.customization ? [c.customization] : []),
        ...(c.cookingInstructions ? [`Instructions: ${c.cookingInstructions}`] : [])
      ],
      createdAt: new Date().toISOString()
    }));

    if (activeOrder) {
      // Add to existing order
      const newItems = [...activeOrder.items, ...orderItems];
      addOrder({
        tableId: selectedTable.id,
        waiterId: user!.id,
        customerId: customerName,
        status: 'pending',
        items: newItems,
        notes: ''
      });
    } else {
      // Create new order
      addOrder({
        tableId: selectedTable.id,
        waiterId: user!.id,
        customerId: customerName,
        status: 'pending',
        items: orderItems,
        notes: ''
      });
    }

    setOrderCart([]);
    setShowMenuDialog(false);
    toast({ title: "Success", description: "Order sent to kitchen" });
  };

  const markItemServed = (orderId: string, itemId: string) => {
    updateOrderItemStatus(orderId, itemId, 'ready');
    toast({ title: "Success", description: "Item marked as served" });
  };

  const cancelItem = (orderId: string, itemId: string) => {
    const order = orders.find(o => o.id === orderId);
    const item = order?.items.find(i => i.id === itemId);
    if (item?.status !== 'pending') {
      toast({ title: "Error", description: "Can only cancel pending items", variant: "destructive" });
      return;
    }
    updateOrderItemStatus(orderId, itemId, 'pending'); // In real app, would have cancel status
    toast({ title: "Success", description: "Item cancelled" });
  };

  const calculateBill = () => {
    if (!activeOrder) return { subtotal: 0, tax: 0, total: 0 };
    
    const subtotal = activeOrder.items.reduce((sum, item) => {
      const menuItem = getMenuItemById(item.itemId);
      return sum + (menuItem?.price || 0) * item.quantity;
    }, 0);
    
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const closeBill = () => {
    if (!selectedTable) return;
    updateTableStatus(selectedTable.id, 'cleaning');
    setSelectedTable(null);
    setCustomerName('');
    setCustomerPhone('');
    setShowBillDialog(false);
    toast({ title: "Success", description: "Bill closed, table set to cleaning" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Waiter Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome, {user?.firstName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <Tabs defaultValue="floor">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="floor">Floor Map</TabsTrigger>
              <TabsTrigger value="orders">Active Orders</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="floor" className="space-y-4">
              <h2 className="text-xl font-semibold">Table Floor Plan</h2>
              <div className="grid grid-cols-4 gap-4">
                {tables.map(table => (
                  <Card
                    key={table.id}
                    className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                      selectedTable?.id === table.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedTable(table);
                      if (table.status === 'available') {
                        setShowAssignDialog(true);
                      }
                    }}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold">Table {table.tableNumber}</div>
                      <Badge
                        variant={
                          table.status === 'available' ? 'default' :
                          table.status === 'occupied' ? 'destructive' :
                          table.status === 'reserved' ? 'secondary' : 'outline'
                        }
                      >
                        {table.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground">{table.seats} seats</div>
                      <div className="text-xs text-muted-foreground">{table.location}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <h2 className="text-xl font-semibold">Active Orders</h2>
              {orders.filter(o => o.status !== 'served' && o.status !== 'cancelled').map(order => {
                const table = tables.find(t => t.id === order.tableId);
                return (
                  <Card key={order.id} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">Table {table?.tableNumber}</h3>
                        <p className="text-sm text-muted-foreground">{order.customerId}</p>
                      </div>
                      <Badge>{order.status}</Badge>
                    </div>
                    <div className="space-y-2">
                      {order.items.map(item => {
                        const menuItem = getMenuItemById(item.itemId);
                        return (
                          <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                            <div className="flex-1">
                              <div className="font-medium">{menuItem?.name}</div>
                              <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                              {item.customizations.length > 0 && (
                                <div className="text-xs text-muted-foreground">{item.customizations.join(', ')}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={item.status === 'ready' ? 'default' : 'secondary'}>
                                {item.status}
                              </Badge>
                              {item.status === 'ready' && (
                                <Button size="sm" onClick={() => markItemServed(order.id, item.id)}>
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              {item.status === 'pending' && (
                                <Button size="sm" variant="destructive" onClick={() => cancelItem(order.id, item.id)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <h2 className="text-xl font-semibold">Order History</h2>
              {tableOrders.map(order => {
                const table = tables.find(t => t.id === order.tableId);
                const bill = calculateBill();
                return (
                  <Card key={order.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Table {table?.tableNumber}</h3>
                        <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <Badge>{order.status}</Badge>
                    </div>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        {selectedTable && selectedTable.status === 'occupied' && (
          <div className="w-96 border-l bg-card p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Table {selectedTable.tableNumber}</h2>
              <Button variant="outline" size="sm" onClick={() => setSelectedTable(null)}>
                Close
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Customer:</span> {customerName}
              </div>
              {customerPhone && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Phone:</span> {customerPhone}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Dialog open={showMenuDialog} onOpenChange={setShowMenuDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Items
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>Select Menu Items</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <ScrollArea className="h-96">
                      <div className="grid grid-cols-2 gap-4">
                        {filteredItems.map(item => (
                          <Card 
                            key={item.id} 
                            className="p-4 cursor-pointer hover:shadow-lg transition-all" 
                            onClick={() => openItemDetails(item)}
                          >
                            {item.image && (
                              <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded mb-2" />
                            )}
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                            <p className="text-lg font-bold mt-2">₹{item.price}</p>
                            <Button size="sm" className="w-full mt-2" onClick={(e) => {
                              e.stopPropagation();
                              openItemDetails(item);
                            }}>
                              <Plus className="h-3 w-3 mr-1" />
                              Add to Cart
                            </Button>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>

                    {orderCart.length > 0 && (
                      <div className="space-y-2 border-t pt-4">
                        <h3 className="font-semibold">Order Cart ({orderCart.length} items)</h3>
                        <ScrollArea className="max-h-64">
                          {orderCart.map((c, idx) => (
                            <Card key={`${c.item.id}-${idx}`} className="p-3 mb-2">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium">{c.item.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    ₹{c.item.price} × {c.quantity} = ₹{c.item.price * c.quantity}
                                  </div>
                                  {c.customization && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      🔹 {c.customization}
                                    </div>
                                  )}
                                  {c.cookingInstructions && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      📝 {c.cookingInstructions}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => updateQuantity(idx, -1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">{c.quantity}</span>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => updateQuantity(idx, 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    onClick={() => removeFromCart(idx)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </ScrollArea>
                        <div className="flex justify-between items-center p-3 bg-muted rounded">
                          <span className="font-semibold">Total:</span>
                          <span className="text-xl font-bold">
                            ₹{orderCart.reduce((sum, c) => sum + c.item.price * c.quantity, 0)}
                          </span>
                        </div>
                        <Button className="w-full" size="lg" onClick={submitOrder}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Submit Order to Kitchen
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Item Details Dialog */}
              <Dialog open={!!selectedMenuItem} onOpenChange={(open) => !open && setSelectedMenuItem(null)}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Customize Your Order</DialogTitle>
                  </DialogHeader>
                  {selectedMenuItem && (
                    <div className="space-y-6">
                      {/* Item Info */}
                      <div className="flex gap-4">
                        {selectedMenuItem.image && (
                          <img 
                            src={selectedMenuItem.image} 
                            alt={selectedMenuItem.name} 
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold">{selectedMenuItem.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{selectedMenuItem.description}</p>
                          <p className="text-2xl font-bold mt-2">₹{selectedMenuItem.price}</p>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Quantity</Label>
                        <div className="flex items-center gap-4">
                          <Button 
                            size="lg" 
                            variant="outline" 
                            onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-2xl font-bold w-12 text-center">{itemQuantity}</span>
                          <Button 
                            size="lg" 
                            variant="outline" 
                            onClick={() => setItemQuantity(itemQuantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <span className="ml-auto text-xl font-bold">
                            ₹{selectedMenuItem.price * itemQuantity}
                          </span>
                        </div>
                      </div>

                      {/* Customizations */}
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Customizations (Optional)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Extra Spicy', 'Medium Spicy', 'Mild', 'No Onion', 'No Garlic', 'Extra Cheese', 'Less Oil', 'Well Done'].map(option => (
                            <Button
                              key={option}
                              variant={itemCustomizations.includes(option) ? 'default' : 'outline'}
                              className="justify-start"
                              onClick={() => toggleCustomization(option)}
                            >
                              {itemCustomizations.includes(option) ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                              {option}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Cooking Instructions */}
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Special Cooking Instructions (Optional)</Label>
                        <Textarea
                          placeholder="E.g., 'Please make it less oily', 'Extra sauce on the side', etc."
                          value={itemCookingInstructions}
                          onChange={(e) => setItemCookingInstructions(e.target.value)}
                          rows={3}
                        />
                      </div>

                      {/* Add to Cart Button */}
                      <Button 
                        className="w-full" 
                        size="lg" 
                        onClick={addItemToCart}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart - ₹{selectedMenuItem.price * itemQuantity}
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowBillDialog(true)}
                disabled={!activeOrder}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Generate Bill
              </Button>
            </div>

            {activeOrder && (
              <div className="space-y-2 border-t pt-4">
                <h3 className="font-semibold">Current Order</h3>
                <ScrollArea className="h-64">
                  {activeOrder.items.map(item => {
                    const menuItem = getMenuItemById(item.itemId);
                    return (
                      <div key={item.id} className="p-2 border rounded mb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{menuItem?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Qty: {item.quantity} | ₹{(menuItem?.price || 0) * item.quantity}
                            </div>
                            {item.customizations.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.customizations.join(', ')}
                              </div>
                            )}
                          </div>
                          <Badge variant={item.status === 'ready' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assign Table Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Table {selectedTable?.tableNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <Button className="w-full" onClick={handleAssignTable}>
              Assign Table
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bill Dialog */}
      <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bill - Table {selectedTable?.tableNumber}</DialogTitle>
          </DialogHeader>
          {activeOrder && (
            <div className="space-y-4">
              <div className="space-y-2">
                {activeOrder.items.map(item => {
                  const menuItem = getMenuItemById(item.itemId);
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{menuItem?.name} × {item.quantity}</span>
                      <span>₹{(menuItem?.price || 0) * item.quantity}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{calculateBill().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%):</span>
                  <span>₹{calculateBill().tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{calculateBill().total.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full" onClick={closeBill}>
                Close Bill & Clear Table
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
