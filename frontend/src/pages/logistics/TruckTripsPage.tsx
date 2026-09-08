import { useState, useEffect } from 'react';
import { truckTripApi } from '../../api/client';
import { formatDateTime, getStatusBadgeClass } from '../../lib/utils';
import { Route, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { TruckTrip } from '../../types';

export function TruckTripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TruckTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const r = await truckTripApi.getAll(1, 50); setTrips(r.data.data.truckTrips || []); }
      catch {} finally { setIsLoading(false); }
    })();
  }, []);

  const canSchedule = ['dispatcher', 'store_manager'].includes(user?.system_role || '');

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div><h1 className="page-title">Truck Trips</h1><p className="page-subtitle">Last-mile delivery schedules</p></div>
        {canSchedule && <button className="btn btn-primary"><Plus size={16} /> Schedule Trip</button>}
      </div>
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
