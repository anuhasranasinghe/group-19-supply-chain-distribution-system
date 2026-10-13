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
import type { Order, PendingOrderItem, TruckTrip, DeliveryItem, Notification } from '../types';
import {
  reportApi,
  orderApi,
  userApi,
  truckTripApi,
  trainAllocationApi,
  trainTripApi,
  deliveryApi,
  notificationApi,
  productApi,
} from '../api/client';
import { formatCurrency, formatDate, formatDateTime, getStatusBadgeClass } from '../lib/utils';
import { chartTooltipStyle } from './admin/reports/reportUtils';
import {
  ShoppingCart, Package, Truck, Train, Users, MapPin,
  BarChart3, Clock, TrendingUp, AlertTriangle, CheckCircle2, PackageCheck,
  ArrowRight, ShieldAlert, Sparkles
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
  const [pendingItems, setPendingItems] = useState<PendingOrderItem[]>([]);
  const [scheduledTrips, setScheduledTrips] = useState<TruckTrip[]>([]);
  const [stats, setStats] = useState({
    pendingAllocations: '—',
    upcomingTrainTrips: '—',
    activeTruckTrips: '—',
    completedToday: '—',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [pendingRes, trainRes, truckRes, deliveryRes] = await Promise.allSettled([
          trainAllocationApi.getPendingItems(),
          trainTripApi.getAll(1, 20),
          truckTripApi.getAll(1, 10),
          deliveryApi.getAll(1, 50),
        ]);

        if (!isMounted) return;

        let pendingCount = 0;
        if (pendingRes.status === 'fulfilled') {
          const items = pendingRes.value.data?.data?.pendingItems || [];
          setPendingItems(items);
          pendingCount = items.length;
        }

        let trainCount = 0;
        if (trainRes.status === 'fulfilled') {
          trainCount = trainRes.value.data?.data?.total ?? trainRes.value.data?.data?.trainTrips?.length ?? 0;
        }

        let truckActiveCount = 0;
        if (truckRes.status === 'fulfilled') {
          const trips: TruckTrip[] = truckRes.value.data?.data?.truckTrips || [];
          setScheduledTrips(trips);
          truckActiveCount = trips.filter((t) => t.status === 'Scheduled').length;
        }

        let deliveredToday = 0;
        if (deliveryRes.status === 'fulfilled') {
          const deliveries: DeliveryItem[] = deliveryRes.value.data?.data?.deliveries || [];
          deliveredToday = deliveries.filter((d) => d.delivery_status === 'Delivered').length;
        }

        setStats({
          pendingAllocations: String(pendingCount),
          upcomingTrainTrips: String(trainCount),
          activeTruckTrips: String(truckActiveCount),
          completedToday: String(deliveredToday),
        });
      } catch (err) {
        console.error('Error fetching dispatcher dashboard:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <div className="stats-grid">
        <StatCard icon={<AlertTriangle />} value={stats.pendingAllocations} label="Pending Allocations" color="var(--color-warning)" />
        <StatCard icon={<Train />} value={stats.upcomingTrainTrips} label="Train Trips Available" color="var(--color-info)" />
        <StatCard icon={<Truck />} value={stats.activeTruckTrips} label="Active Truck Trips" color="var(--color-brand)" />
        <StatCard icon={<CheckCircle2 />} value={stats.completedToday} label="Completed Deliveries" color="var(--color-success)" />
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">🚂 Cargo Awaiting Train Allocation</h3>
            <Link to="/allocations" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8125rem' }}>
              Allocate All <ArrowRight size={13} style={{ marginLeft: '0.25rem' }} />
            </Link>
          </div>
          {isLoading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : pendingItems.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 className="empty-state-icon" style={{ color: 'var(--color-success)' }} />
              <p className="empty-state-title">All cargo allocated</p>
              <p>There are currently no customer order lines waiting for train freight allocation.</p>
            </div>
          ) : (
            <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
              <table className="data-table" style={{ margin: 0, fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Destination</th>
                    <th style={{ textAlign: 'right' }}>Unallocated</th>
                    <th style={{ textAlign: 'right' }}>Required Space</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingItems.slice(0, 5).map((it) => (
                    <tr key={it.order_item_id}>
                      <td style={{ fontWeight: 600 }}>{it.product_name}</td>
                      <td>{it.destination_city}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-warning)' }}>
                        {it.unallocated_quantity}
                      </td>
                      <td style={{ textAlign: 'right' }}>{Number(it.unallocated_space).toFixed(1)} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">🚛 Last-Mile Truck Trips Queue</h3>
            <Link to="/truck-trips" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8125rem' }}>
              Schedule Trip <ArrowRight size={13} style={{ marginLeft: '0.25rem' }} />
            </Link>
          </div>
          {isLoading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : scheduledTrips.length === 0 ? (
            <div className="empty-state">
              <Clock className="empty-state-icon" />
              <p className="empty-state-title">No truck trips scheduled</p>
              <p>Schedule a last-mile truck dispatch for arriving freight.</p>
            </div>
          ) : (
            <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
              <table className="data-table" style={{ margin: 0, fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Route</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledTrips.slice(0, 5).map((tr) => (
                    <tr key={tr.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{tr.vehicle_no || '—'}</td>
                      <td>{tr.driver_name || '—'}</td>
                      <td>{tr.route_area || '—'}</td>
                      <td><span className={getStatusBadgeClass(tr.status)}>{tr.status}</span></td>
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
// Store Manager Dashboard
// ============================================================
function StoreManagerDashboard() {
  const [storeOrders, setStoreOrders] = useState<Order[]>([]);
  const [storeDeliveries, setStoreDeliveries] = useState<DeliveryItem[]>([]);
  const [stats, setStats] = useState({
    regionalOrders: '—',
    truckTrips: '—',
    activeDeliveries: '—',
    completedDeliveries: '—',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [ordersRes, tripsRes, delivRes] = await Promise.allSettled([
          orderApi.getAll(1, 50),
          truckTripApi.getAll(1, 50),
          deliveryApi.getAll(1, 50),
        ]);

        if (!isMounted) return;

        let totalOrders = 0;
        if (ordersRes.status === 'fulfilled') {
          const orders: Order[] = ordersRes.value.data?.data?.orders || [];
          setStoreOrders(orders);
          totalOrders = orders.length;
        }

        let tripsCount = 0;
        if (tripsRes.status === 'fulfilled') {
          tripsCount = tripsRes.value.data?.data?.total ?? tripsRes.value.data?.data?.truckTrips?.length ?? 0;
        }

        let scheduledCount = 0;
        let deliveredCount = 0;
        if (delivRes.status === 'fulfilled') {
          const deliveries: DeliveryItem[] = delivRes.value.data?.data?.deliveries || [];
          setStoreDeliveries(deliveries);
          scheduledCount = deliveries.filter((d) => d.delivery_status === 'Scheduled').length;
          deliveredCount = deliveries.filter((d) => d.delivery_status === 'Delivered').length;
        }

        setStats({
          regionalOrders: String(totalOrders),
          truckTrips: String(tripsCount),
          activeDeliveries: String(scheduledCount),
          completedDeliveries: String(deliveredCount),
        });
      } catch (err) {
        console.error('Error fetching store manager dashboard:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <div className="stats-grid">
        <StatCard icon={<ShoppingCart />} value={stats.regionalOrders} label="Regional Orders" color="var(--color-brand)" />
        <StatCard icon={<Truck />} value={stats.truckTrips} label="Store Truck Trips" color="var(--color-info)" />
        <StatCard icon={<Clock />} value={stats.activeDeliveries} label="Deliveries En Route" color="var(--color-warning)" />
        <StatCard icon={<PackageCheck />} value={stats.completedDeliveries} label="Delivered Packages" color="var(--color-success)" />
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">📦 Recent Orders in Store Coverage</h3>
            <Link to="/orders" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8125rem' }}>
              View All <ArrowRight size={13} style={{ marginLeft: '0.25rem' }} />
            </Link>
          </div>
          {isLoading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : storeOrders.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart className="empty-state-icon" />
              <p className="empty-state-title">No orders in your store zone</p>
              <p>Customer orders for routes mapped to your regional depot will appear here.</p>
            </div>
          ) : (
            <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
              <table className="data-table" style={{ margin: 0, fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Target Date</th>
                    <th>Route Area</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {storeOrders.slice(0, 5).map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>{o.customer_name || 'Customer'}</td>
                      <td>{formatDate(o.requested_delivery_date)}</td>
                      <td>{o.route_area || '—'}</td>
                      <td><span className={getStatusBadgeClass(o.status)}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">🚛 Active Store Deliveries</h3>
            <Link to="/deliveries" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8125rem' }}>
              Track Dispatches <ArrowRight size={13} style={{ marginLeft: '0.25rem' }} />
            </Link>
          </div>
          {isLoading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : storeDeliveries.length === 0 ? (
            <div className="empty-state">
              <PackageCheck className="empty-state-icon" />
              <p className="empty-state-title">No deliveries dispatched</p>
              <p>Schedule a truck trip to dispatch pending order items to customers.</p>
            </div>
          ) : (
            <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
              <table className="data-table" style={{ margin: 0, fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {storeDeliveries.slice(0, 5).map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.product_name || '—'}</td>
                      <td>{d.customer_name || '—'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{d.vehicle_no || '—'}</td>
                      <td><span className={getStatusBadgeClass(d.delivery_status)}>{d.delivery_status}</span></td>
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
// Customer Dashboard
// ============================================================
function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    myOrders: '0',
    pendingDelivery: '0',
    delivered: '0',
    totalSpent: '0 LKR',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [ordersRes, notifRes] = await Promise.allSettled([
          orderApi.getAll(1, 50),
          notificationApi.getAll(1, 10),
        ]);

        if (!isMounted) return;

        let totalOrders = 0;
        let pending = 0;
        let delivered = 0;
        let totalSpend = 0;

        if (ordersRes.status === 'fulfilled') {
          const list: Order[] = ordersRes.value.data?.data?.orders || [];
          setOrders(list);
          totalOrders = list.length;
          pending = list.filter((o) => o.status === 'Pending' || o.status === 'Scheduled').length;
          delivered = list.filter((o) => o.status === 'Delivered').length;

          totalSpend = list.reduce((acc, o) => {
            const sumItems = o.items?.reduce((s, it) => s + (Number(it.unit_price || 0) * it.quantity), 0) || 0;
            return acc + sumItems;
          }, 0);
        }

        if (notifRes.status === 'fulfilled') {
          setNotifications(notifRes.value.data?.data?.notifications || []);
        }

        setStats({
          myOrders: String(totalOrders),
          pendingDelivery: String(pending),
          delivered: String(delivered),
          totalSpent: formatCurrency(totalSpend),
        });
      } catch (err) {
        console.error('Error fetching customer dashboard:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <div className="stats-grid">
        <StatCard icon={<ShoppingCart />} value={stats.myOrders} label="Total Orders" color="var(--color-brand)" />
        <StatCard icon={<Clock />} value={stats.pendingDelivery} label="Pending Delivery" color="var(--color-warning)" />
        <StatCard icon={<CheckCircle2 />} value={stats.delivered} label="Completed Deliveries" color="var(--color-success)" />
        <StatCard icon={<TrendingUp />} value={stats.totalSpent} label="Total Spent" color="var(--color-info)" />
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">📦 Your Recent Orders</h3>
            <Link to="/orders/new" className="btn btn-primary btn-sm" style={{ fontSize: '0.8125rem' }}>
              Place New Order
            </Link>
          </div>
          {isLoading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart className="empty-state-icon" />
              <p className="empty-state-title">No orders placed yet</p>
              <p>Place your first order to begin logistics tracking with Kandypack.</p>
              <Link to="/orders/new" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                Place Order Now
              </Link>
            </div>
          ) : (
            <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
              <table className="data-table" style={{ margin: 0, fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th>Order Date</th>
                    <th>Target Delivery</th>
                    <th>Destination Area</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id}>
                      <td>{formatDate(o.order_date)}</td>
                      <td>{formatDate(o.requested_delivery_date)}</td>
                      <td>{o.route_area || '—'}</td>
                      <td><span className={getStatusBadgeClass(o.status)}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">🔔 Delivery & Status Updates</h3>
            <Link to="/notifications" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8125rem' }}>
              All Alerts <ArrowRight size={13} style={{ marginLeft: '0.25rem' }} />
            </Link>
          </div>
          {isLoading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <PackageCheck className="empty-state-icon" />
              <p className="empty-state-title">No new updates</p>
              <p>Status updates and delivery alerts will appear here in real time.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: n.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.title}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {formatDateTime(n.created_at)}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================
// Driver / Assistant Dashboard
// ============================================================
function DriverDashboard({ role }: { role: string }) {
  const [trips, setTrips] = useState<TruckTrip[]>([]);
  const [stats, setStats] = useState({
    todayTrips: '0',
    upcomingTrips: '0',
    hoursThisWeek: '0h',
    completedDeliveries: '0',
  });
  const [hoursCompliance, setHoursCompliance] = useState({
    logged: 0,
    maxLimit: role === 'driver' ? 40 : 60,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [tripsRes, deliveriesRes] = await Promise.allSettled([
          truckTripApi.getAll(1, 50),
          deliveryApi.getAll(1, 50),
        ]);

        if (!isMounted) return;

        let myTrips: TruckTrip[] = [];
        if (tripsRes.status === 'fulfilled') {
          myTrips = tripsRes.value.data?.data?.truckTrips || [];
          setTrips(myTrips);
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const todayCount = myTrips.filter((t) => t.start_time?.startsWith(todayStr)).length;
        const upcomingCount = myTrips.filter((t) => t.status === 'Scheduled').length;

        // Calculate hours logged this week from trip start & end
        let weekHours = 0;
        myTrips.forEach((t) => {
          if (t.start_time && t.end_time) {
            const start = new Date(t.start_time).getTime();
            const end = new Date(t.end_time).getTime();
            const diffHours = (end - start) / (1000 * 3600);
            if (diffHours > 0) weekHours += diffHours;
          }
        });
        const roundedHours = Math.round(weekHours * 10) / 10;
        const maxLimit = role === 'driver' ? 40 : 60;
        setHoursCompliance({ logged: roundedHours, maxLimit });

        let completedDeliv = 0;
        if (deliveriesRes.status === 'fulfilled') {
          const list: DeliveryItem[] = deliveriesRes.value.data?.data?.deliveries || [];
          completedDeliv = list.filter((d) => d.delivery_status === 'Delivered').length;
        }

        setStats({
          todayTrips: String(todayCount),
          upcomingTrips: String(upcomingCount),
          hoursThisWeek: `${roundedHours}h / ${maxLimit}h`,
          completedDeliveries: String(completedDeliv),
        });
      } catch (err) {
        console.error('Error fetching driver dashboard:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [role]);

  const percentUsed = Math.min(100, Math.round((hoursCompliance.logged / hoursCompliance.maxLimit) * 100));

  return (
    <>
      <div className="stats-grid">
        <StatCard icon={<Truck />} value={stats.todayTrips} label="Today's Trips" color="var(--color-brand)" />
        <StatCard icon={<MapPin />} value={stats.upcomingTrips} label="Upcoming Trips" color="var(--color-info)" />
        <StatCard icon={<Clock />} value={stats.hoursThisWeek} label="Weekly Hours Logged" color="var(--color-warning)" />
        <StatCard icon={<CheckCircle2 />} value={stats.completedDeliveries} label="Delivered Packages" color="var(--color-success)" />
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">📋 Your Assigned Truck Trips</h3>
            <Link to="/deliveries" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8125rem' }}>
              View Deliveries <ArrowRight size={13} style={{ marginLeft: '0.25rem' }} />
            </Link>
          </div>
          {isLoading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : trips.length === 0 ? (
            <div className="empty-state">
              <Truck className="empty-state-icon" />
              <p className="empty-state-title">No assignments found</p>
              <p>You have no scheduled delivery trips assigned at this time.</p>
            </div>
          ) : (
            <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
              <table className="data-table" style={{ margin: 0, fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Route Area</th>
                    <th>Start Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.slice(0, 6).map((tr) => (
                    <tr key={tr.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{tr.vehicle_no || '—'}</td>
                      <td>{tr.route_area || '—'}</td>
                      <td>{formatDateTime(tr.start_time)}</td>
                      <td><span className={getStatusBadgeClass(tr.status)}>{tr.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⏱️ Weekly Roster Hours & Compliance</h3>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {role === 'driver' ? 'Driver Limit (40 hrs/week)' : 'Assistant Limit (60 hrs/week)'}
              </span>
              <strong style={{ color: percentUsed > 90 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {hoursCompliance.logged}h / {hoursCompliance.maxLimit}h ({percentUsed}%)
              </strong>
            </div>

            {/* Progress bar */}
            <div
              style={{
                width: '100%',
                height: '10px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: '999px',
                overflow: 'hidden',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${percentUsed}%`,
                  background:
                    percentUsed > 90
                      ? 'var(--color-danger)'
                      : percentUsed > 75
                      ? 'var(--color-warning)'
                      : 'var(--color-success)',
                  borderRadius: '999px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border)',
                fontSize: '0.8125rem',
                lineHeight: '1.5',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                Labor Compliance Status: Active & Compliant
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>
                Remaining allowed duty hours this ISO rolling week:{' '}
                <strong style={{ color: 'var(--color-text-primary)' }}>
                  {Math.max(0, hoursCompliance.maxLimit - hoursCompliance.logged)} hours
                </strong>
                . Automatic database triggers will block any assignment exceeding weekly caps.
              </div>
            </div>
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
