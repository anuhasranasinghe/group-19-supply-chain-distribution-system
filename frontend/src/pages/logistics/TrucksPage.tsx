import { useState, useEffect } from 'react';
import { truckApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { Truck as TruckIcon, Plus } from 'lucide-react';
import type { Truck } from '../../types';

export function TrucksPage() {
  const { user } = useAuth();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ vehicle_no: '', capacity: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchTrucks = async () => {
    try {
      const r = await truckApi.getAll(1, 50);
      setTrucks(r.data.data.trucks || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load trucks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await truckApi.create({
        vehicle_no: formData.vehicle_no.trim(),
        capacity: parseFloat(formData.capacity),
      });
      setShowForm(false);
      setFormData({ vehicle_no: '', capacity: '' });
      fetchTrucks();
    } catch (err: any) {
      setError(err.message || 'Failed to create truck');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div><h1 className="page-title">Trucks</h1><p className="page-subtitle">Manage delivery fleet</p></div>
        {user?.system_role === 'admin' && (
          <button
            className="btn btn-primary"
            onClick={() => { setShowForm(true); setFormData({ vehicle_no: '', capacity: '' }); setError(''); }}
          >
            <Plus size={16} /> Add Truck
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
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>New Truck</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Vehicle Number</label>
              <input
                className="form-input"
                placeholder="e.g. WP-CAB-1234"
                value={formData.vehicle_no}
                onChange={e => setFormData(p => ({ ...p, vehicle_no: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Capacity (Volume)</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 100"
                value={formData.capacity}
                onChange={e => setFormData(p => ({ ...p, capacity: e.target.value }))}
                required
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
        : trucks.length === 0 ? (
          <div className="empty-state"><TruckIcon className="empty-state-icon" /><p className="empty-state-title">No trucks found</p><p>Fleet data will appear once queries are implemented</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Vehicle No</th><th>Capacity</th></tr></thead>
            <tbody>{trucks.map(t => <tr key={t.id}><td style={{ fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{t.vehicle_no}</td><td>{t.capacity}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
