// Orders Page — List and manage orders
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatCurrency, getStatusBadgeClass } from '../../lib/utils';
import {
  ShoppingCart, Plus, Eye, X, Package, MapPin, Calendar, Phone, User, CheckCircle2
} from 'lucide-react';
import type { Order } from '../../types';

interface OrderDetailItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  unit_space_consumption: number;
  quantity: number;
  line_total: number;
}

interface OrderDetail extends Order {
  customer_name: string;
  customer_phone?: string;
  route_area?: string;
  items: OrderDetailItem[];
}

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Order Details Modal state
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await orderApi.getAll(1, 50);
        setOrders(res.data.data.orders || []);
      } catch (err: any) { setError(err.message); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const handleViewOrder = async (orderId: string) => {
    setIsLoadingDetail(true);
    setDetailError('');
    setSelectedOrder(null);
    try {
      const res = await orderApi.getById(orderId);
      setSelectedOrder(res.data.data.order);
    } catch (err: any) {
      setDetailError(err.message || 'Failed to load order details');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const canManageStatus = ['admin', 'dispatcher', 'store_manager'].includes(user?.system_role || '');

  const handleUpdateOrderStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    setStatusFeedback(null);
    try {
      await orderApi.updateStatus(selectedOrder.id, newStatus);
      setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus as any } : o));
      setStatusFeedback({ type: 'success', message: `Order status updated to "${newStatus}" successfully.` });
    } catch (err: any) {
      setStatusFeedback({
        type: 'error',
        message: err.response?.data?.error?.message || err.message || 'Failed to update order status',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setDetailError('');
    setStatusFeedback(null);
  };

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
            <p>No customer orders are currently on record for this store or account.</p>
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
                  <td>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      title="View Order Details"
                      onClick={() => handleViewOrder(order.id)}
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details Modal Dialog */}
      {(selectedOrder || isLoadingDetail || detailError) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={handleCloseModal}
        >
          <div
            className="card"
            style={{
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'var(--color-brand-light)', color: 'var(--color-brand)', borderRadius: 'var(--radius-md)' }}>
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="card-title" style={{ fontSize: '1.125rem', margin: 0 }}>
                    Order Details
                  </h3>
                  {selectedOrder && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      #{selectedOrder.id}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {selectedOrder && (
                  <span className={getStatusBadgeClass(selectedOrder.status)}>
                    {selectedOrder.status}
                  </span>
                )}
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={handleCloseModal}
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            {isLoadingDetail ? (
              <div className="loading-container" style={{ minHeight: '180px' }}>
                <div className="spinner" />
              </div>
            ) : detailError ? (
              <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                {detailError}
              </div>
            ) : selectedOrder ? (
              <div>
                {/* Meta details grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    background: 'var(--color-bg-primary)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={13} /> Customer
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>
                      {selectedOrder.customer_name || 'Customer'}
                    </div>
                    {selectedOrder.customer_phone && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                        <Phone size={11} /> {selectedOrder.customer_phone}
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={13} /> Destination & Route
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>
                      {selectedOrder.route_area || 'Assigned Route'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                      {selectedOrder.delivery_address}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} /> Schedule Timelines
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                      <strong>Ordered:</strong> {formatDate(selectedOrder.order_date)}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                      <strong>Delivery Target:</strong> {formatDate(selectedOrder.requested_delivery_date)}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                  Ordered Items ({selectedOrder.items?.length || 0})
                </h4>

                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.25rem' }}>
                  <table className="data-table" style={{ margin: 0, fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th style={{ textAlign: 'right' }}>Space / Unit</th>
                        <th style={{ textAlign: 'right' }}>Unit Price</th>
                        <th style={{ textAlign: 'right' }}>Qty</th>
                        <th style={{ textAlign: 'right' }}>Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                              {item.product_name}
                            </td>
                            <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                              {item.unit_space_consumption} units
                            </td>
                            <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                              {formatCurrency(Number(item.unit_price))}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>
                              {item.quantity}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-brand-hover)' }}>
                              {formatCurrency(Number(item.line_total || item.quantity * item.unit_price))}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            No items recorded for this order.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Summary Totals */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.875rem 1rem',
                    background: 'var(--color-bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    Total Cargo Space Consumed:{' '}
                    <strong style={{ color: 'var(--color-text-primary)' }}>
                      {selectedOrder.items?.reduce((acc, it) => acc + (it.quantity * (Number(it.unit_space_consumption) || 0)), 0).toFixed(2)} units
                    </strong>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-success)' }}>
                    Grand Total:{' '}
                    {formatCurrency(
                      selectedOrder.items?.reduce((acc, it) => acc + Number(it.line_total || it.quantity * it.unit_price), 0) || 0
                    )}
                  </div>
                {/* Staff Order Status Controls */}
                {canManageStatus && (
                  <div
                    style={{
                      padding: '1rem',
                      background: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        Manage Order Status
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                        Current Status:{' '}
                        <span className={getStatusBadgeClass(selectedOrder.status)} style={{ marginLeft: '0.35rem' }}>
                          {selectedOrder.status}
                        </span>
                      </span>
                    </div>

                    {statusFeedback && (
                      <div
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8125rem',
                          marginBottom: '0.75rem',
                          background: statusFeedback.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: statusFeedback.type === 'success' ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {statusFeedback.message}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {(['Pending', 'Scheduled', 'Delivered', 'Cancelled'] as const).map((st) => (
                        <button
                          key={st}
                          className={`btn btn-sm ${selectedOrder.status === st ? 'btn-primary' : 'btn-secondary'}`}
                          disabled={isUpdatingStatus || selectedOrder.status === st}
                          onClick={() => handleUpdateOrderStatus(st)}
                          style={{ fontSize: '0.8125rem' }}
                        >
                          Mark {st}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

