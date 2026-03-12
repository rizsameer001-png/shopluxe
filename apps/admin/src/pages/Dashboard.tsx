import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Package, Users, ShoppingCart, DollarSign, AlertTriangle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#0f172a', '#475569', '#94a3b8', '#cbd5e1', '#e2e8f0'];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => adminAPI.getStats(),
    refetchInterval: 60000,
  });

  const stats = data?.data?.data;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-3 w-24" />
              <div className="h-8 bg-gray-200 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const revenueData = (stats?.revenueByMonth || []).map((m: any) => ({
    month: monthNames[m._id.month - 1],
    revenue: Math.round(m.revenue),
    orders: m.orders,
  }));

  const orderStatusData = (stats?.ordersByStatus || []).map((s: any) => ({
    name: s._id,
    value: s.count,
  }));

  const metricCards = [
    {
      title: 'Total Revenue',
      value: `$${(overview.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subValue: `$${(overview.monthRevenue || 0).toLocaleString()} this month`,
      growth: overview.revenueGrowth,
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Total Orders',
      value: overview.totalOrders?.toLocaleString() || '0',
      subValue: `${overview.monthOrders || 0} this month`,
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Total Users',
      value: overview.totalUsers?.toLocaleString() || '0',
      subValue: `+${overview.monthUsers || 0} this month`,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Products',
      value: overview.totalProducts?.toLocaleString() || '0',
      subValue: `${overview.lowStockProducts || 0} low in stock`,
      icon: Package,
      color: overview.lowStockProducts > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600',
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metricCards.map(card => (
          <div key={card.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{card.subValue}</p>
              {card.growth !== undefined && (
                <span className={`flex items-center gap-1 text-xs font-medium ${card.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {card.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(card.growth)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Revenue Overview</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">No revenue data yet</div>
          )}
        </div>

        {/* Order Status Pie */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Orders by Status</h3>
          {orderStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                    {orderStatusData.map((_: any, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {orderStatusData.slice(0, 5).map((item: any, i: number) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="capitalize text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">No orders yet</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900">Recent Orders</h3>
            <Link to="/orders" className="text-xs text-gray-500 hover:text-gray-900 font-medium">View all →</Link>
          </div>
          <div className="space-y-3">
            {(stats?.recentOrders || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
            ) : (
              (stats?.recentOrders || []).map((order: any) => (
                <Link key={order._id} to={`/orders/${order._id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-600">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.user?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">${order.totalPrice?.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900">Top Products</h3>
            <Link to="/products" className="text-xs text-gray-500 hover:text-gray-900 font-medium">View all →</Link>
          </div>
          <div className="space-y-3">
            {(stats?.topProducts || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No products yet</p>
            ) : (
              (stats?.topProducts || []).map((product: any, i: number) => (
                <div key={product._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                    {i + 1}
                  </span>
                  <img src={product.images?.[0]?.url || 'https://via.placeholder.com/40'} alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">${product.price} · {product.salesCount} sold</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
