import { useState, useEffect } from 'react';
import { routeApi, storeApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, Plus } from 'lucide-react';
import type { Route, Store } from '../../types';

export function RoutesPage() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ store_id: '', area_name: '', max_delivery_time: '04:00:00' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchRoutes = async () => {
    try {
      const r = await routeApi.getAll(1, 50);
      setRoutes(r.data.data.routes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load routes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleOpenForm = async () => {
    setShowForm(true);
    setError('');
    try {
      const s = await storeApi.getAll(1, 100);
      const storeList = s.data.data.stores || [];
      setStores(storeList);
      if (storeList.length > 0 && !formData.store_id) {
        setFormData(p => ({ ...p, store_id: storeList[0].id }));
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await routeApi.create({
        store_id: formData.store_id,
        area_name: formData.area_name.trim(),
        max_delivery_time: formData.max_delivery_time.trim() || undefined,
      });
      setShowForm(false);
      setFormData({ store_id: stores[0]?.id || '', area_name: '', max_delivery_time: '04:00:00' });
      fetchRoutes();
    } catch (err: any) {
      setError(err.message || 'Failed to create route');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div><h1 className="page-title">Delivery Routes</h1><p className="page-subtitle">Manage last-mile delivery routes</p></div>
        {user?.system_role === 'admin' && (
          <button className="btn btn-primary" onClick={handleOpenForm}>
            <Plus size={16} /> Add Route
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>
          {error}
        </div>
      )}

      {showForm && user?.system_role === 'admin' && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>New Delivery Route</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Store</label>
              <select
                className="form-select"
                value={formData.store_id}
                onChange={e => setFormData(p => ({ ...p, store_id: e.target.value }))}
                required
              >
                {stores.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Area Name</label>
              <input
                className="form-input"
                placeholder="e.g. Kandy City & Suburbs"
                value={formData.area_name}
                onChange={e => setFormData(p => ({ ...p, area_name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Max Delivery Time</label>
              <input
                className="form-input"
                placeholder="e.g. 04:00:00"
                value={formData.max_delivery_time}
                onChange={e => setFormData(p => ({ ...p, max_delivery_time: e.target.value }))}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
