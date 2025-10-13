import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, ChefHat, Users, UtensilsCrossed, LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Role-based navigation
    switch (user.role) {
      case 'customer':
        navigate('/customer/menu');
        break;
      case 'waiter':
        navigate('/waiter/orders');
        break;
      case 'chef':
        navigate('/chef/kitchen');
        break;
      case 'admin':
        // Stay on dashboard
        break;
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Restaurant POS</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user.firstName}!</h2>
          <p className="text-muted-foreground">Select a section to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/customer/menu')}>
            <CardHeader>
              <UtensilsCrossed className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Customer Portal</CardTitle>
              <CardDescription>Browse menu and place orders</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/waiter/orders')}>
            <CardHeader>
              <Users className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Waiter Dashboard</CardTitle>
              <CardDescription>Manage orders and tables</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/chef/kitchen')}>
            <CardHeader>
              <ChefHat className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Chef Dashboard</CardTitle>
              <CardDescription>Kitchen display system</CardDescription>
            </CardHeader>
          </Card>

          {user.role === 'admin' && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/analytics')}>
              <CardHeader>
                <LayoutDashboard className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>Manage users, menu, and analytics</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
