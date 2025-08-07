import { useQuery } from '@tanstack/react-query';
import { useBackend } from '../hooks/useBackend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wallet, Receipt, Bell, X, BarChart3 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ReportsSection from '../components/ReportsSection';
import { useState } from 'react';

export default function Dashboard() {
  const { toast } = useToast();
  const backend = useBackend();
  const [showReports, setShowReports] = useState(false);
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => backend.expense.getDashboardStats(),
  });

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => backend.expense.getNotifications(),
  });

  const markNotificationRead = async (notificationId: number) => {
    try {
      await backend.expense.markNotificationRead({ notificationId });
      // Refresh notifications
      window.location.reload();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut marca notificarea ca citită.",
        variant: "destructive",
      });
    }
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ro-RO').format(new Date(date));
  };

  const notifications = notificationsData?.notifications || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button
          onClick={() => setShowReports(!showReports)}
          variant={showReports ? "default" : "outline"}
          className={showReports ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" : ""}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          {showReports ? 'Ascunde Rapoarte' : 'Vezi Rapoarte'}
        </Button>
      </div>
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notificări
          </h2>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card key={notification.id} className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        {notification.message}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Scadență: {formatDate(notification.dueDate)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markNotificationRead(notification.id)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Venituri Totale
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.totalIncome || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Cheltuieli Totale
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.totalExpenses || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Sold
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (stats?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(stats?.balance || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tranzacții
            </CardTitle>
            <Receipt className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.transactionCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Section */}
      {showReports && <ReportsSection />}
    </div>
  );
}
