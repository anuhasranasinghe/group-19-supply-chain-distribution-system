import { useState, useEffect } from 'react';
import { deliveryApi } from '../../api/client';
import { getStatusBadgeClass, formatDateTime } from '../../lib/utils';
import { PackageCheck } from 'lucide-react';
import type { DeliveryItem } from '../../types';

export function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const r = await deliveryApi.getAll(1, 50); setDeliveries(r.data.data.deliveries || []); }
      catch {} finally { setIsLoading(false); }
    })();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Deliveries</h1>
        <p className="page-subtitle">Track last-mile delivery status</p>
      </div>
      <div className="card">
        {isLoading ? <div className="loading-container"><div className="spinner" /></div>
        : deliveries.length === 0 ? (
          <div className="empty-state"><PackageCheck className="empty-state-icon" /><p className="empty-state-title">No deliveries found</p><p>Delivery tracking data will appear once queries are implemented</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Product</th><th>Quantity</th><th>Status</th><th>Delivered At</th></tr></thead>
            <tbody>{deliveries.map(d => (
              <tr key={d.id}>
                <td style={{ fontWeight: 500 }}>{d.product_name || '—'}</td><td>{d.quantity}</td>
                <td><span className={getStatusBadgeClass(d.delivery_status)}>{d.delivery_status}</span></td>
                <td>{d.delivered_at ? formatDateTime(d.delivered_at) : '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
