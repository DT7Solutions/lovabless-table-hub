import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogOut, Check, ChefHat, Clock, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Order, OrderItem } from '@/types';

export default function ChefDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();           
    navigate('/login'); 
  };
  const { orders, tables, menuItems, updateOrderItemStatus, getMenuItemById, getTableById } = useData();
  const [selectedTab, setSelectedTab] = useState('pending');

  // Filter orders by status
  const pendingOrders = orders.filter(o => 
    o.status === 'pending' && o.items.some(i => i.status === 'pending')
  );
  
  const acceptedOrders = orders.filter(o => 
    o.items.some(i => i.status === 'in_progress')
  );
  
  const readyOrders = orders.filter(o => 
    o.items.some(i => i.status === 'ready')
  );

  const acceptOrder = (orderId: string, itemId: string) => {
    updateOrderItemStatus(orderId, itemId, 'in_progress');
    toast({ 
      title: "Order Accepted", 
      description: "Item moved to cooking queue"
    });
  };

  const markReadyToCook = (orderId: string, itemId: string) => {
    // In real app, would have more statuses
    toast({ 
      title: "Ready to Cook", 
      description: "Item preparation started"
    });
  };

  const markCooking = (orderId: string, itemId: string) => {
    toast({ 
      title: "Cooking", 
      description: "Item is being cooked"
    });
  };

  const markReady = (orderId: string, itemId: string) => {
    updateOrderItemStatus(orderId, itemId, 'ready');
    toast({ 
      title: "Item Ready", 
      description: "Waiter has been notified",
      variant: "default"
    });
  };

  const acceptAllItems = (order: Order) => {
    order.items
      .filter(i => i.status === 'pending')
      .forEach(item => {
        updateOrderItemStatus(order.id, item.id, 'in_progress');
      });
    toast({ 
      title: "All Items Accepted", 
      description: `Order from Table ${getTableById(order.tableId)?.tableNumber} accepted`
    });
  };

  const renderOrderCard = (order: Order, showActions: boolean = true) => {
    const table = getTableById(order.tableId);
    const orderTime = new Date(order.createdAt).toLocaleTimeString();

    return (
      <Card key={order.id} className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">Table {table?.tableNumber}</h3>
            <p className="text-sm text-muted-foreground">
              <Clock className="h-3 w-3 inline mr-1" />
              {orderTime} • {order.customerId}
            </p>
            <Badge variant="secondary" className="mt-1">
              {order.items.length} items
            </Badge>
          </div>
          {showActions && selectedTab === 'pending' && (
            <Button size="sm" onClick={() => acceptAllItems(order)}>
              Accept All
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {order.items
            .filter(item => {
              if (selectedTab === 'pending') return item.status === 'pending';
              if (selectedTab === 'cooking') return item.status === 'in_progress';
              if (selectedTab === 'ready') return item.status === 'ready';
              return true;
            })
            .map(item => {
              const menuItem = getMenuItemById(item.itemId);
              return (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 space-y-2 bg-card hover:bg-accent transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{menuItem?.name}</h4>
                        <Badge variant="outline">Qty: {item.quantity}</Badge>
                      </div>
                      {item.customizations.length > 0 && (
                        <div className="mt-1 p-2 bg-warning/10 border border-warning/20 rounded text-sm">
                          <span className="font-medium text-warning">Special Instructions:</span>
                          <div className="text-muted-foreground mt-1">
                            {item.customizations.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                    <Badge 
                      variant={
                        item.status === 'pending' ? 'secondary' :
                        item.status === 'in_progress' ? 'default' :
                        'default'
                      }
                    >
                      {item.status === 'pending' ? 'New Order' :
                       item.status === 'in_progress' ? 'Cooking' :
                       'Ready'}
                    </Badge>
                  </div>

                  {showActions && (
                    <div className="flex gap-2 pt-2">
                      {item.status === 'pending' && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => acceptOrder(order.id, item.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                      )}
                      {item.status === 'in_progress' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => markCooking(order.id, item.id)}
                          >
                            <ChefHat className="h-4 w-4 mr-1" />
                            Cooking
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => markReady(order.id, item.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Ready
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {order.notes && (
          <div className="text-sm text-muted-foreground border-t pt-2">
            <span className="font-medium">Order Notes:</span> {order.notes}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <ChefHat className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Kitchen Display System</h1>
            <p className="text-sm text-muted-foreground">Chef: {user?.firstName} {user?.lastName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
            <div className="text-xs text-muted-foreground">Pending Orders</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{acceptedOrders.length}</div>
            <div className="text-xs text-muted-foreground">Cooking</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{readyOrders.length}</div>
            <div className="text-xs text-muted-foreground">Ready</div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="pending" className="relative">
              Pending Orders
              {pendingOrders.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center" variant="destructive">
                  {pendingOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cooking" className="relative">
              Cooking
              {acceptedOrders.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {acceptedOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ready" className="relative">
              Ready to Serve
              {readyOrders.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center" variant="secondary">
                  {readyOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Pending Orders</h3>
                <p className="text-muted-foreground">All orders have been accepted</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders.map(order => renderOrderCard(order))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cooking" className="space-y-4">
            {acceptedOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Orders Cooking</h3>
                <p className="text-muted-foreground">Accept orders from pending queue</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {acceptedOrders.map(order => renderOrderCard(order))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ready" className="space-y-4">
            {readyOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Items Ready</h3>
                <p className="text-muted-foreground">Complete cooking to mark items as ready</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {readyOrders.map(order => renderOrderCard(order, false))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders
                  .filter(o => o.status !== 'served' && o.status !== 'cancelled')
                  .map(order => renderOrderCard(order, false))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
