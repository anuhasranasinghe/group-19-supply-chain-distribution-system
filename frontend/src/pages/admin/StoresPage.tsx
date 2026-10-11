// Placeholder pages for entities following standard CRUD patterns.
// Each page uses the same structure: header, optional form, table.
// Replace the empty state content once SQL queries are implemented.

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { storeApi } from '../../api/client';
import { Store as StoreIcon, Plus } from 'lucide-react';
import type { Store } from '../../types';

export function StoresPage() {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', city: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchStores = async () => {
    try {
      const r = await storeApi.getAll(1, 50);
      setStores(r.data.data.stores || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load stores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await storeApi.create({
        name: formData.name.trim(),
        city: formData.city.trim(),
        location: formData.location.trim() || undefined,
      });
      setShowForm(false);
      setFormData({ name: '', city: '', location: '' });
      fetchStores();
    } catch (err: any) {
      setError(err.message || 'Failed to create store');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div><h1 className="page-title">Stores</h1><p className="page-subtitle">Manage destination stores</p></div>
        {user?.system_role === 'admin' && (
          <button
            className="btn btn-primary"
            onClick={() => { setShowForm(true); setFormData({ name: '', city: '', location: '' }); setError(''); }}
          >
            <Plus size={16} /> Add Store
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
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>New Store</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Store Name</label>
              <input
                className="form-input"
                placeholder="e.g. Kandy Regional Depot"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">City</label>
              <input
                className="form-input"
                placeholder="e.g. Kandy"
                value={formData.city}
                onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Location / Address</label>
              <input
                className="form-input"
                placeholder="e.g. Goods Shed Yard"
                value={formData.location}
                onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
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
        : stores.length === 0 ? (
          <div className="empty-state"><StoreIcon className="empty-state-icon" /><p className="empty-state-title">No stores found</p><p>Stores will appear once database queries are implemented</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>City</th><th>Location</th><th>Manager</th></tr></thead>
            <tbody>{stores.map(s => <tr key={s.id}><td style={{ fontWeight: 500 }}>{s.name}</td><td>{s.city}</td><td>{s.location || '—'}</td><td>{s.manager_name || '—'}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
