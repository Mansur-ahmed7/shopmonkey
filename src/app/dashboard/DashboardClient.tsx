'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarButton } from "@/components/ui/star-button";
import { 
  ClipboardList, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  Receipt,
  Car,
  Plus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  workOrders: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
  customers: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
  revenue: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
  pendingInvoices: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
  completionRate: number;
}

interface RecentActivity {
  id: string;
  workOrderNumber: string;
  customerName: string;
  vehicleName: string;
  status: string;
  updatedAt: Date;
}

interface DashboardClientProps {
  userName: string;
  stats: DashboardStats;
  recentActivity: RecentActivity[];
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export default function DashboardClient({ userName, stats, recentActivity }: DashboardClientProps) {
  const statCards = [
    {
      name: 'Total Work Orders',
      value: stats.workOrders.value.toString(),
      change: stats.workOrders.change,
      trend: stats.workOrders.trend,
      icon: ClipboardList,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Active Customers',
      value: stats.customers.value.toString(),
      change: stats.customers.change,
      trend: stats.customers.trend,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: 'Monthly Revenue',
      value: `$${stats.revenue.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: stats.revenue.change,
      trend: stats.revenue.trend,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Pending Invoices',
      value: stats.pendingInvoices.value.toString(),
      change: stats.pendingInvoices.change,
      trend: stats.pendingInvoices.trend,
      icon: Receipt,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {userName}
            </h1>
            <p className="mt-1 text-gray-600">
              Here's what's happening with your shop today
            </p>
          </div>
          <div className="flex gap-3">
            <StarButton variant="secondary">
              View Reports
            </StarButton>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            return (
              <Card key={stat.name} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02] group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <TrendIcon className={`h-4 w-4 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                        <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change}
                        </span>
                        <span className="text-sm text-gray-600">vs last month</span>
                      </div>
                    </div>
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity and Performance Metrics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates from your shop</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 rounded-lg p-3 transition-all hover:bg-gray-50 hover:shadow-sm hover:scale-[1.02] cursor-pointer border border-transparent hover:border-gray-200">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Car className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-900">{activity.workOrderNumber}</p>
                          <Badge className={statusColors[activity.status]}>
                            {activity.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {activity.customerName} - {activity.vehicleName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(activity.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Shop performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                    <span className="text-sm font-bold text-gray-900">{stats.completionRate}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                      style={{ width: `${stats.completionRate}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Work Orders This Month</span>
                    <span className="text-sm font-bold text-gray-900">{stats.workOrders.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                      style={{ width: `${Math.min(100, (stats.workOrders.value / 50) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Revenue Target</span>
                    <span className="text-sm font-bold text-gray-900">
                      ${stats.revenue.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / $50,000
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                      style={{ width: `${Math.min(100, (stats.revenue.value / 50000) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
