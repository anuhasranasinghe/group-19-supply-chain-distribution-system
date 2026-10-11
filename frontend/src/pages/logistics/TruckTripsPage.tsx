import { useState, useEffect } from 'react';
import { truckTripApi, truckApi, routeApi, userApi } from '../../api/client';
import { formatDateTime, getStatusBadgeClass } from '../../lib/utils';
import { Route, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { TruckTrip, Truck, Route as RouteType, User } from '../../types';

export function TruckTripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TruckTrip[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [assistants, setAssistants] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    truck_id: '',
    driver_id: '',
    assistant_id: '',
    route_id: '',
    start_time: '',
    end_time: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchTrips = async () => {
    try {
      const r = await truckTripApi.getAll(1, 50);
      setTrips(r.data.data.truckTrips || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load truck trips');
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
      const [tRes, rRes, uRes] = await Promise.all([
        truckApi.getAll(1, 100),
        routeApi.getAll(1, 100),
        userApi.getAll(1, 100),
      ]);

      const truckList = tRes.data.data.trucks || [];
      const routeList = rRes.data.data.routes || [];
      const userList: User[] = uRes.data.data.users || [];

      const driverList = userList.filter(u => u.system_role === 'driver');
      const assistantList = userList.filter(u => u.system_role === 'assistant');

      setTrucks(truckList);
      setRoutes(routeList);
      setDrivers(driverList);
      setAssistants(assistantList);

      setFormData(prev => ({
        ...prev,
        truck_id: prev.truck_id || truckList[0]?.id || '',
        driver_id: prev.driver_id || driverList[0]?.id || '',
        assistant_id: prev.assistant_id || assistantList[0]?.id || '',
        route_id: prev.route_id || routeList[0]?.id || '',
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load scheduling resources');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (!formData.truck_id || !formData.driver_id || !formData.assistant_id || !formData.route_id || !formData.start_time) {
        throw new Error('Please select all required resources and a start time.');
      }

      await truckTripApi.create({
        truck_id: formData.truck_id,
        driver_id: formData.driver_id,
        assistant_id: formData.assistant_id,
        route_id: formData.route_id,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : undefined,
      });

      setShowForm(false);
      fetchTrips();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule truck trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSchedule = ['admin', 'dispatcher', 'store_manager'].includes(user?.system_role || '');

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div><h1 className="page-title">Truck Trips</h1><p className="page-subtitle">Last-mile delivery schedules</p></div>
        {canSchedule && (
          <button className="btn btn-primary" onClick={handleOpenForm}>
            <Plus size={16} /> Schedule Trip
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>
          {error}
        </div>
      )}

      {showForm && canSchedule && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>Schedule Truck Delivery Trip</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Truck</label>
              <select
                className="form-select"
                value={formData.truck_id}
                onChange={e => setFormData(p => ({ ...p, truck_id: e.target.value }))}
                required
              >
                {trucks.map(t => (
                  <option key={t.id} value={t.id}>{t.vehicle_no} (Cap: {t.capacity})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Driver</label>
              <select
                className="form-select"
                value={formData.driver_id}
                onChange={e => setFormData(p => ({ ...p, driver_id: e.target.value }))}
                required
              >
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.username})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Assistant</label>
              <select
                className="form-select"
                value={formData.assistant_id}
                onChange={e => setFormData(p => ({ ...p, assistant_id: e.target.value }))}
                required
              >
                {assistants.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.username})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Delivery Route</label>
              <select
                className="form-select"
                value={formData.route_id}
                onChange={e => setFormData(p => ({ ...p, route_id: e.target.value }))}
                required
              >
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.area_name} ({r.store_city || 'Store'})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Start Time</label>
              <input
                className="form-input"
                type="datetime-local"
                value={formData.start_time}
                onChange={e => setFormData(p => ({ ...p, start_time: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Est. End Time</label>
              <input
                className="form-input"
                type="datetime-local"
                value={formData.end_time}
                onChange={e => setFormData(p => ({ ...p, end_time: e.target.value }))}
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
          <div className="empty-state"><Route className="empty-state-icon" /><p className="empty-state-title">No truck trips found</p><p>Truck trip schedules will appear once queries are implemented</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Vehicle</th><th>Driver</th><th>Assistant</th><th>Route</th><th>Start</th><th>Status</th></tr></thead>
            <tbody>{trips.map(t => (
              <tr key={t.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{t.vehicle_no || '—'}</td>
                <td>{t.driver_name || '—'}</td><td>{t.assistant_name || '—'}</td><td>{t.route_area || '—'}</td>
                <td>{formatDateTime(t.start_time)}</td>
                <td><span className={getStatusBadgeClass(t.status)}>{t.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
