// Orders Page — List and manage orders
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, getStatusBadgeClass } from '../../lib/utils';
import { ShoppingCart, Plus, Eye } from 'lucide-react';
import type { Order } from '../../types';

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await orderApi.getAll(1, 50);
        setOrders(res.data.data.orders || []);
      } catch (err: any) { setError(err.message); }
      finally { setIsLoading(false); }
    })();
  }, []);

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{user?.system_role === 'customer' ? 'Your order history' : 'Manage customer orders'}</p>
        </div>
        {user?.system_role === 'customer' && (
          <Link to="/orders/new" className="btn btn-primary"><Plus size={16} /> Place Order</Link>
        )}
      </div>
      {error && <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>{error}</div>}
      <div className="card">
        {isLoading ? <div className="loading-container"><div className="spinner" /></div>
        : orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart className="empty-state-icon" />
            <p className="empty-state-title">No orders found</p>
            <p>Orders will appear here once the database queries are implemented</p>
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Order ID</th><th>Date</th><th>Delivery Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{order.id.slice(0, 8)}...</td>
                  <td>{formatDate(order.order_date)}</td>
                  <td>{formatDate(order.requested_delivery_date)}</td>
                  <td><span className={getStatusBadgeClass(order.status)}>{order.status}</span></td>
                  <td><button className="btn btn-ghost btn-icon btn-sm"><Eye size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
