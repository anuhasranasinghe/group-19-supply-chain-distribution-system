import { useState, useEffect } from 'react';
import { trainTripApi } from '../../api/client';
import { formatDate, formatDateTime } from '../../lib/utils';
import { Train, Plus } from 'lucide-react';
import type { TrainTrip } from '../../types';

export function TrainTripsPage() {
  const [trips, setTrips] = useState<TrainTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const r = await trainTripApi.getAll(1, 50); setTrips(r.data.data.trainTrips || []); }
      catch {} finally { setIsLoading(false); }
    })();
  }, []);

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div><h1 className="page-title">Train Trips</h1><p className="page-subtitle">Manage rail cargo schedules from Kandy</p></div>
        <button className="btn btn-primary"><Plus size={16} /> Schedule Trip</button>
      </div>
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
