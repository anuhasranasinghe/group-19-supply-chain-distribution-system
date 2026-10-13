import { useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../api/client';
import { formatDateTime } from '../lib/utils';
import {
  Bell,
  CheckCheck,
  Package,
  Truck,
  Calendar,
  Info,
  Clock,
  CheckCircle,
} from 'lucide-react';
import type { Notification } from '../types';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await notificationApi.getAll(1, 50);
      const items: Notification[] = res.data.data.notifications || [];
      setNotifications(items);
      setUnreadCount(res.data.data.unread ?? items.filter((n) => !n.is_read).length);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  };

  const filteredList =
    filter === 'unread'
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order_update':
        return <Package size={18} style={{ color: '#6366f1' }} />;
      case 'delivery_update':
        return <Truck size={18} style={{ color: '#22c55e' }} />;
      case 'assignment':
        return <Calendar size={18} style={{ color: '#f59e0b' }} />;
      default:
        return <Info size={18} style={{ color: '#3b82f6' }} />;
    }
  };

  return (
    <div>
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            Stay updated on your orders, trips, and delivery dispatches
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleMarkAllRead}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner" />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="empty-state">
            <Bell className="empty-state-icon" />
            <p className="empty-state-title">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </p>
            <p>
              {filter === 'unread'
                ? "You're all caught up with your updates."
                : 'System alerts, order status updates, and schedules will appear here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredList.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: item.is_read
                    ? 'transparent'
                    : 'rgba(99, 102, 241, 0.05)',
                  border: item.is_read
                    ? '1px solid var(--color-border)'
                    : '1px solid rgba(99, 102, 241, 0.3)',
                  transition: 'background 0.2s ease',
                }}
              >
                <div
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getTypeIcon(item.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontWeight: item.is_read ? 500 : 700,
                          color: 'var(--color-text-primary)',
                          fontSize: '0.9375rem',
                        }}
                      >
                        {item.title}
                      </span>
                      {!item.is_read && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#6366f1',
                            display: 'inline-block',
                          }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Clock size={12} />
                      {formatDateTime(item.created_at)}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-secondary)',
                      margin: '0 0 0.5rem 0',
                      lineHeight: '1.4',
                    }}
                  >
                    {item.message}
                  </p>

                  {!item.is_read && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => handleMarkRead(item.id)}
                    >
                      <CheckCircle size={12} style={{ marginRight: '0.3rem' }} />
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

