// ============================================================
// App — Root Component with Routing
// ============================================================
// Sets up the complete routing structure for the application.
// Routes are organized by feature area with role-based access
// controls using the ProtectedRoute wrapper.
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LandingPage } from './pages/LandingPage';

// Main Pages
import { DashboardPage } from './pages/DashboardPage';
import { NotificationsPage } from './pages/NotificationsPage';

// Admin Pages
import { ProductsPage } from './pages/admin/ProductsPage';
import { StoresPage } from './pages/admin/StoresPage';
import { RoutesPage } from './pages/admin/RoutesPage';
import { UsersPage } from './pages/admin/UsersPage';
import { ReportsPage } from './pages/admin/ReportsPage';

// Order Pages
import { OrdersPage } from './pages/orders/OrdersPage';
import { PlaceOrderPage } from './pages/orders/PlaceOrderPage';

// Logistics Pages
import { TrainTripsPage } from './pages/logistics/TrainTripsPage';
import { AllocationsPage } from './pages/logistics/AllocationsPage';
import { TrucksPage } from './pages/logistics/TrucksPage';
import { TruckTripsPage } from './pages/logistics/TruckTripsPage';
import { DeliveriesPage } from './pages/logistics/DeliveriesPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes — No Authentication Required */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes — Wrapped in AppLayout (sidebar + content) */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            {/* Dashboard — All roles */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Orders — All authenticated roles (service enforces data-level auth) */}
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/new" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PlaceOrderPage />
              </ProtectedRoute>
            } />

            {/* Logistics — Role-restricted */}
            <Route path="/train-trips" element={
              <ProtectedRoute allowedRoles={['admin', 'dispatcher']}>
                <TrainTripsPage />
              </ProtectedRoute>
            } />
            <Route path="/allocations" element={
              <ProtectedRoute allowedRoles={['admin', 'dispatcher']}>
                <AllocationsPage />
              </ProtectedRoute>
            } />
            <Route path="/trucks" element={
              <ProtectedRoute allowedRoles={['admin', 'dispatcher']}>
                <TrucksPage />
              </ProtectedRoute>
            } />
            <Route path="/truck-trips" element={<TruckTripsPage />} />
            <Route path="/deliveries" element={<DeliveriesPage />} />

            {/* Management — Role-restricted */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/stores" element={
              <ProtectedRoute allowedRoles={['admin', 'dispatcher', 'store_manager']}>
                <StoresPage />
              </ProtectedRoute>
            } />
            <Route path="/routes" element={
              <ProtectedRoute allowedRoles={['admin', 'dispatcher', 'store_manager']}>
                <RoutesPage />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            } />

            {/* Reports — Admin only */}
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReportsPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Default fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
