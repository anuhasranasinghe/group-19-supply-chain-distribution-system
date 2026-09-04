// ============================================================
// Sidebar Component — Role-Aware Navigation
// ============================================================
// Renders different navigation items based on the user's role.
// This is the primary navigation component for the application.
// ============================================================

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../lib/utils';
import {
  LayoutDashboard, Package, MapPin, ShoppingCart, Train, Truck,
  Users, BarChart3, Store, Route, ClipboardList, Bell, LogOut,
  PackageCheck
} from 'lucide-react';
import type { SystemRole } from '../../types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: SystemRole[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard />, roles: ['admin', 'dispatcher', 'store_manager', 'driver', 'assistant', 'customer'] },
    ],
  },
  {
    title: 'Orders',
    items: [
      { label: 'Orders', path: '/orders', icon: <ShoppingCart />, roles: ['admin', 'dispatcher', 'store_manager', 'customer'] },
      { label: 'Place Order', path: '/orders/new', icon: <ClipboardList />, roles: ['customer'] },
    ],
  },
  {
    title: 'Logistics',
    items: [
      { label: 'Train Trips', path: '/train-trips', icon: <Train />, roles: ['admin', 'dispatcher'] },
      { label: 'Allocations', path: '/allocations', icon: <PackageCheck />, roles: ['dispatcher'] },
      { label: 'Trucks', path: '/trucks', icon: <Truck />, roles: ['admin', 'dispatcher'] },
      { label: 'Truck Trips', path: '/truck-trips', icon: <Route />, roles: ['admin', 'dispatcher', 'store_manager', 'driver', 'assistant'] },
      { label: 'Deliveries', path: '/deliveries', icon: <PackageCheck />, roles: ['admin', 'dispatcher', 'store_manager', 'driver', 'assistant', 'customer'] },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Products', path: '/products', icon: <Package />, roles: ['admin', 'dispatcher', 'store_manager', 'customer'] },
      { label: 'Stores', path: '/stores', icon: <Store />, roles: ['admin', 'dispatcher', 'store_manager'] },
      { label: 'Routes', path: '/routes', icon: <MapPin />, roles: ['admin', 'dispatcher', 'store_manager'] },
      { label: 'Users', path: '/users', icon: <Users />, roles: ['admin'] },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Reports', path: '/reports', icon: <BarChart3 />, roles: ['admin'] },
    ],
  },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const filteredSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(user.system_role)),
    }))
    .filter(section => section.items.length > 0);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">Kandypack SCDS</div>
        <div className="sidebar-subtitle">Supply Chain System</div>
      </div>

      <nav className="sidebar-nav">
        {filteredSections.map((section) => (
          <div key={section.title}>
            <div className="sidebar-section-title">{section.title}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Bell />
          <span>Notifications</span>
        </NavLink>
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{getInitials(user.name)}</div>
          <div>
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">{user.system_role.replace('_', ' ')}</div>
          </div>
        </div>
        <button className="nav-item" onClick={logout} style={{ width: '100%', marginTop: '0.25rem' }}>
          <LogOut />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
