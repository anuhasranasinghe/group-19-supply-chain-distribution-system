import { useState, useEffect } from 'react';
import { trainTripApi, storeApi } from '../../api/client';
import { formatDate, formatDateTime } from '../../lib/utils';
import { Train, Plus } from 'lucide-react';
import type { TrainTrip, Store } from '../../types';

export function TrainTripsPage() {
  const [trips, setTrips] = useState<TrainTrip[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    destination_store_id: '',
    to_city: 'Colombo',
    trip_date: new Date().toISOString().split('T')[0],
    departure_time: '',
    arrival_time: '',
    max_capacity: '1000',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchTrips = async () => {
    try {
      const r = await trainTripApi.getAll(1, 50);
      setTrips(r.data.data.trainTrips || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load train trips');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleOpenForm = async () => {
    setShowForm(true);
    setError('');
    try {
      const s = await storeApi.getAll(1, 100);
      const storeList = s.data.data.stores || [];
      setStores(storeList);
      if (storeList.length > 0 && !formData.destination_store_id) {
        setFormData(p => ({
          ...p,
          destination_store_id: storeList[0].id,
          to_city: storeList[0].city,
        }));
      }
    } catch {}
  };

  const handleStoreChange = (storeId: string) => {
    const selected = stores.find(s => s.id === storeId);
    setFormData(p => ({
      ...p,
      destination_store_id: storeId,
      to_city: selected ? selected.city : p.to_city,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (!formData.departure_time || !formData.arrival_time) {
        throw new Error('Departure and arrival times are required');
      }

      await trainTripApi.create({
        destination_store_id: formData.destination_store_id || undefined,
        to_city: formData.to_city.trim(),
        trip_date: formData.trip_date,
        departure_time: new Date(formData.departure_time).toISOString(),
        arrival_time: new Date(formData.arrival_time).toISOString(),
        max_capacity: parseInt(formData.max_capacity, 10),
      });

      setShowForm(false);
      fetchTrips();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule train trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div><h1 className="page-title">Train Trips</h1><p className="page-subtitle">Manage rail cargo schedules from Kandy</p></div>
        <button className="btn btn-primary" onClick={handleOpenForm}>
          <Plus size={16} /> Schedule Trip
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>
          {error}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>Schedule Rail Trip</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Destination Store</label>
              <select
                className="form-select"
                value={formData.destination_store_id}
                onChange={e => handleStoreChange(e.target.value)}
              >
                {stores.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Destination City</label>
              <input
                className="form-input"
                value={formData.to_city}
                onChange={e => setFormData(p => ({ ...p, to_city: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Trip Date</label>
              <input
                className="form-input"
                type="date"
                value={formData.trip_date}
                onChange={e => setFormData(p => ({ ...p, trip_date: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Departure Time</label>
              <input
                className="form-input"
                type="datetime-local"
                value={formData.departure_time}
                onChange={e => setFormData(p => ({ ...p, departure_time: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Arrival Time</label>
              <input
                className="form-input"
                type="datetime-local"
                value={formData.arrival_time}
                onChange={e => setFormData(p => ({ ...p, arrival_time: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Max Capacity</label>
              <input
                className="form-input"
                type="number"
                min="1"
                step="1"
                value={formData.max_capacity}
                onChange={e => setFormData(p => ({ ...p, max_capacity: e.target.value }))}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'end' }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Scheduling...' : 'Schedule'}
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
        : trips.length === 0 ? (
          <div className="empty-state"><Train className="empty-state-icon" /><p className="empty-state-title">No train trips found</p><p>Train schedules will appear once database queries are implemented</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Date</th><th>From</th><th>To</th><th>Departure</th><th>Arrival</th><th>Capacity</th><th>Available</th></tr></thead>
            <tbody>{trips.map(t => (
              <tr key={t.id}>
                <td>{formatDate(t.trip_date)}</td><td>{t.from_city}</td><td>{t.to_city}</td>
                <td>{formatDateTime(t.departure_time)}</td><td>{formatDateTime(t.arrival_time)}</td>
                <td>{t.max_capacity}</td><td style={{ color: 'var(--color-success)' }}>{t.remaining_capacity ?? '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
