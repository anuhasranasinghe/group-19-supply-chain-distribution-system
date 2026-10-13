// ============================================================
// Dashboard Page — Role-Specific Landing Page
// ============================================================
// Renders different dashboard content based on the user's role.
// Each role sees stats, quick actions, and recent data relevant
// to their responsibilities.
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../types';
import type { Order } from '../types';
import { reportApi, orderApi, userApi, truckTripApi } from '../api/client';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../lib/utils';
import { chartTooltipStyle } from './admin/reports/reportUtils';
import {
  ShoppingCart, Package, Truck, Train, Users, MapPin,
  BarChart3, Clock, TrendingUp, AlertTriangle, CheckCircle2, PackageCheck,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p className="page-subtitle">
          {ROLE_LABELS[user.system_role]} Dashboard — Here's an overview of your operations
        </p>
      </div>

      {/* Role-specific dashboard content */}
      {user.system_role === 'admin' && <AdminDashboard />}
      {user.system_role === 'dispatcher' && <DispatcherDashboard />}
      {user.system_role === 'store_manager' && <StoreManagerDashboard />}
      {user.system_role === 'customer' && <CustomerDashboard />}
      {(user.system_role === 'driver' || user.system_role === 'assistant') && <DriverDashboard role={user.system_role} />}
    </div>
  );
}

// ============================================================
// Admin Dashboard
// ============================================================
function AdminDashboard() {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: '—',
    revenue: '—',
    activeDeliveries: '—',
    totalUsers: '—',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        const [salesRes, ordersRes, usersRes, tripsRes] = await Promise.allSettled([
          reportApi.quarterlySales(),
          orderApi.getAll(1, 5),
          userApi.getAll(1, 1),
          truckTripApi.getAll(1, 1),
        ]);

        if (!isMounted) return;

        let totalRev = 0;
        let deliveredOrders = 0;

        if (salesRes.status === 'fulfilled') {
          const rawSales = salesRes.value.data?.data || [];
          totalRev = rawSales.reduce((acc: number, row: any) => acc + Number(row.total_revenue || 0), 0);
          deliveredOrders = rawSales.reduce((acc: number, row: any) => acc + Number(row.order_count || 0), 0);

          // Reverse for chronological timeline display
          const formatted = [...rawSales]
            .reverse()
            .map((row: any) => ({
              period: `Q${row.quarter} ${row.year}`,
              revenue: Number(row.total_revenue || 0),
              volume: Number(row.total_volume || 0),
              orders: Number(row.order_count || 0),
            }));
          setSalesData(formatted);
        }

        let totalOrdersCount = deliveredOrders;
        if (ordersRes.status === 'fulfilled') {
          const orderData = ordersRes.value.data?.data;
          setRecentOrders(orderData?.orders || []);
          if (orderData?.total !== undefined) {
            totalOrdersCount = orderData.total;
          }
        }

        let userCount = '—';
        if (usersRes.status === 'fulfilled') {
          userCount = String(usersRes.value.data?.data?.total ?? '—');
        }

        let tripsCount = '—';
        if (tripsRes.status === 'fulfilled') {
          tripsCount = String(tripsRes.value.data?.data?.total ?? '—');
        }

        setStats({
          totalOrders: totalOrdersCount ? String(totalOrdersCount) : '0',
          revenue: formatCurrency(totalRev),
          activeDeliveries: tripsCount,
          totalUsers: userCount,
        });
      } catch (err: any) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <div className="stats-grid">
        <StatCard icon={<ShoppingCart />} value={stats.totalOrders} label="Total Orders" color="var(--color-brand)" />
        <StatCard icon={<TrendingUp />} value={stats.revenue} label="Revenue (Delivered)" color="var(--color-success)" />
        <StatCard icon={<Truck />} value={stats.activeDeliveries} label="Total Truck Trips" color="var(--color-warning)" />
        <StatCard icon={<Users />} value={stats.totalUsers} label="Total Users" color="var(--color-info)" />
      </div>
      <div className="content-grid" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} style={{ color: 'var(--color-brand)' }} />
              Quarterly Sales Overview
            </h3>
            <Link
              to="/admin/reports/quarterly-sales"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.8125rem', gap: '0.25rem' }}
            >
              Full Report <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="loading-container" style={{ minHeight: '260px' }}>
              <div className="spinner" />
            </div>
          ) : salesData.length === 0 ? (
            <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
              <BarChart3 className="empty-state-icon" />
              <p className="empty-state-title">No Sales Data Available</p>
              <p>Delivered orders will appear here once recorded.</p>
            </div>
          ) : (
            <div style={{ width: '100%', height: 280, marginTop: '0.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                  <YAxis
                    yAxisId="left"
                    stroke="#6366f1"
                    fontSize={12}
                    tickFormatter={(val) => `LKR ${(val / 1000).toFixed(0)}k`}
                  />
                  <YAxis yAxisId="right" orientation="right" stroke="#22c55e" fontSize={12} />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value: any, name: any) => {
                      if (name === 'Revenue (LKR)') return [formatCurrency(Number(value)), name];
                      return [Number(value).toLocaleString() + ' units', name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.8125rem', paddingTop: '6px' }} />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue (LKR)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="volume" name="Cargo Volume (units)" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={18} style={{ color: 'var(--color-brand)' }} />
              Recent Orders
            </h3>
            <Link
              to="/orders"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.8125rem', gap: '0.25rem' }}
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="loading-container" style={{ minHeight: '260px' }}>
              <div className="spinner" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
              <ShoppingCart className="empty-state-icon" />
              <p className="empty-state-title">No orders yet</p>
              <p>Customer orders will appear here once placed.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          #{order.id.slice(0, 8)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {formatDate(order.order_date)}
                        </div>
                      </td>
                      <td>
                        <div>{order.customer_name || 'Customer'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {order.route_area || 'Route'}
                        </div>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(order.status)}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================
// Dispatcher Dashboard
// ============================================================
function DispatcherDashboard() {
  return (
    <>
      <div className="stats-grid">
        <StatCard icon={<AlertTriangle />} value="—" label="Pending Allocations" color="var(--color-warning)" />
        <StatCard icon={<Train />} value="—" label="Upcoming Train Trips" color="var(--color-info)" />
        <StatCard icon={<Truck />} value="—" label="Active Truck Trips" color="var(--color-brand)" />
        <StatCard icon={<CheckCircle2 />} value="—" label="Completed Today" color="var(--color-success)" />
      </div>
      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🚂 Train Trips Needing Allocation</h3>
          </div>
          <div className="empty-state">
            <Train className="empty-state-icon" />
            <p className="empty-state-title">No pending allocations</p>
            <p>Order items waiting for train assignment will appear here</p>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🚛 Scheduling Queue</h3>
          </div>
          <div className="empty-state">
            <Clock className="empty-state-icon" />
            <p className="empty-state-title">No trips to schedule</p>
            <p>Truck trips needing scheduling will appear here</p>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// Store Manager Dashboard
// ============================================================
function StoreManagerDashboard() {
  return (
    <>
      <div className="stats-grid">
        <StatCard icon={<Train />} value="—" label="Incoming Cargo" color="var(--color-info)" />
        <StatCard icon={<Package />} value="—" label="Inventory Items" color="var(--color-brand)" />
        <StatCard icon={<Truck />} value="—" label="Pending Dispatches" color="var(--color-warning)" />
        <StatCard icon={<PackageCheck />} value="—" label="Active Deliveries" color="var(--color-success)" />
      </div>
      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📥 Incoming Train Cargo</h3>
          </div>
          <div className="empty-state">
            <Train className="empty-state-icon" />
            <p className="empty-state-title">No incoming cargo</p>
            <p>Train shipments arriving at your store will appear here</p>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🏪 Store Inventory</h3>
          </div>
          <div className="empty-state">
            <Package className="empty-state-icon" />
            <p className="empty-state-title">No inventory data</p>
            <p>Product stock levels will appear here</p>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// Customer Dashboard
// ============================================================
function CustomerDashboard() {
  return (
    <>
      <div className="stats-grid">
        <StatCard icon={<ShoppingCart />} value="—" label="My Orders" color="var(--color-brand)" />
        <StatCard icon={<Clock />} value="—" label="Pending Delivery" color="var(--color-warning)" />
        <StatCard icon={<CheckCircle2 />} value="—" label="Delivered" color="var(--color-success)" />
        <StatCard icon={<TrendingUp />} value="—" label="Total Spent (LKR)" color="var(--color-info)" />
      </div>
      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📦 Recent Orders</h3>
          </div>
          <div className="empty-state">
            <ShoppingCart className="empty-state-icon" />
            <p className="empty-state-title">No orders yet</p>
            <p>Your order history will appear here. Place your first order!</p>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔔 Delivery Updates</h3>
          </div>
          <div className="empty-state">
            <PackageCheck className="empty-state-icon" />
            <p className="empty-state-title">No updates</p>
            <p>Delivery status notifications will appear here</p>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// Driver / Assistant Dashboard
// ============================================================
function DriverDashboard({ role }: { role: string }) {
  return (
    <>
      <div className="stats-grid">
        <StatCard icon={<Truck />} value="—" label="Today's Trips" color="var(--color-brand)" />
        <StatCard icon={<MapPin />} value="—" label="Upcoming Trips" color="var(--color-info)" />
        <StatCard icon={<Clock />} value="—" label="Hours This Week" color="var(--color-warning)" />
        <StatCard icon={<CheckCircle2 />} value="—" label="Completed Deliveries" color="var(--color-success)" />
      </div>
      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 Today's Assignments</h3>
          </div>
          <div className="empty-state">
            <Truck className="empty-state-icon" />
            <p className="empty-state-title">No assignments today</p>
            <p>Your assigned truck trips will appear here</p>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⏱️ Weekly Hours Summary</h3>
          </div>
          <div className="empty-state">
            <Clock className="empty-state-icon" />
            <p className="empty-state-title">No hours logged</p>
            <p>
              {role === 'driver' ? 'Limit: 40 hours/week' : 'Limit: 60 hours/week'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// Stat Card Component
// ============================================================
function StatCard({ icon, value, label, color }: {
  icon: React.ReactNode; value: string; label: string; color: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
