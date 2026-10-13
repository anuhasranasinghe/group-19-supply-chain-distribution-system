import { useState, useEffect } from 'react';
import { deliveryApi } from '../../api/client';
import { getStatusBadgeClass, formatDateTime } from '../../lib/utils';
import { PackageCheck, Truck, MapPin, CheckCircle, Clock } from 'lucide-react';
import type { DeliveryItem } from '../../types';

export function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await deliveryApi.getAll(1, 50);
        setDeliveries(r.data.data.deliveries || []);
      } catch {
        // silent fail
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const totalDeliveries = deliveries.length;
  const deliveredCount = deliveries.filter((d) => d.delivery_status === 'Delivered').length;
  const scheduledCount = deliveries.filter((d) => d.delivery_status === 'Scheduled').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Deliveries</h1>
          <p className="page-subtitle">Track and verify last-mile package fulfillment</p>
        </div>
      </div>

      {totalDeliveries > 0 && (
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <Truck size={20} />
            </div>
            <div className="stat-value">{totalDeliveries}</div>
            <div className="stat-label">Total Assigned Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
              <Clock size={20} />
            </div>
            <div className="stat-value">{scheduledCount}</div>
            <div className="stat-label">En Route / Scheduled</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
              <CheckCircle size={20} />
            </div>
            <div className="stat-value">{deliveredCount}</div>
            <div className="stat-label">Delivered Successfully</div>
          </div>
        </div>
      )}

      <div className="card">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner" />
          </div>
        ) : deliveries.length === 0 ? (
          <div className="empty-state">
            <PackageCheck className="empty-state-icon" />
            <p className="empty-state-title">No deliveries found</p>
            <p>No delivery packages are currently dispatched for your assigned store or account.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Customer & Destination</th>
                <th>Vehicle & Route</th>
                <th>Status</th>
                <th>Delivered At</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {d.product_name || '—'}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{d.quantity}</td>
                  <td>
                    {d.customer_name ? (
                      <div>
                        <div style={{ fontWeight: 500 }}>{d.customer_name}</div>
                        {d.delivery_address && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                            <MapPin size={12} />
                            <span>{d.delivery_address}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {d.vehicle_no ? (
                      <div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{d.vehicle_no}</span>
                        {d.route_area && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}>
                            ({d.route_area})
                          </span>
                        )}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(d.delivery_status)}>{d.delivery_status}</span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    {d.delivered_at ? formatDateTime(d.delivered_at) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

