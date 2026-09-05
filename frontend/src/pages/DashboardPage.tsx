// ============================================================
// Dashboard Page — Role-Specific Landing Page
// ============================================================
// Renders different dashboard content based on the user's role.
// Each role sees stats, quick actions, and recent data relevant
// to their responsibilities.
// ============================================================

import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../types';
import {
  ShoppingCart, Package, Truck, Train, Users, MapPin,
  BarChart3, Clock, TrendingUp, AlertTriangle, CheckCircle2, PackageCheck
} from 'lucide-react';

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
  return (
    <>
      <div className="stats-grid">
        <StatCard icon={<ShoppingCart />} value="—" label="Total Orders" color="var(--color-brand)" />
        <StatCard icon={<TrendingUp />} value="—" label="Revenue (LKR)" color="var(--color-success)" />
        <StatCard icon={<Truck />} value="—" label="Active Deliveries" color="var(--color-warning)" />
        <StatCard icon={<Users />} value="—" label="Total Users" color="var(--color-info)" />
      </div>
      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Quarterly Sales Overview</h3>
          </div>
          <div className="empty-state">
            <BarChart3 className="empty-state-icon" />
            <p className="empty-state-title">Sales chart will appear here</p>
            <p>Implement the quarterly sales SQL query to populate this chart</p>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📦 Recent Orders</h3>
          </div>
          <div className="empty-state">
            <ShoppingCart className="empty-state-icon" />
            <p className="empty-state-title">No orders yet</p>
            <p>Orders will appear here once the database queries are implemented</p>
          </div>
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
