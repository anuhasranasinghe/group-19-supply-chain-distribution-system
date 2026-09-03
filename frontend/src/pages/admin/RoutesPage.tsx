import { useState, useEffect } from 'react';
import { routeApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, Plus } from 'lucide-react';
import type { Route } from '../../types';

export function RoutesPage() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const r = await routeApi.getAll(1, 50); setRoutes(r.data.data.routes || []); }
      catch {} finally { setIsLoading(false); }
    })();
  }, []);

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div><h1 className="page-title">Delivery Routes</h1><p className="page-subtitle">Manage last-mile delivery routes</p></div>
        {user?.system_role === 'admin' && <button className="btn btn-primary"><Plus size={16} /> Add Route</button>}
      </div>
      <div className="card">
        {isLoading ? <div className="loading-container"><div className="spinner" /></div>
        : routes.length === 0 ? (
          <div className="empty-state"><MapPin className="empty-state-icon" /><p className="empty-state-title">No routes found</p><p>Routes will appear once database queries are implemented</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Area Name</th><th>Store</th><th>City</th><th>Max Delivery Time</th></tr></thead>
            <tbody>{routes.map(r => <tr key={r.id}><td style={{ fontWeight: 500 }}>{r.area_name}</td><td>{r.store_name || '—'}</td><td>{r.store_city || '—'}</td><td>{r.max_delivery_time || '—'}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
