import { useState, useEffect } from 'react';
import { truckApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { Truck as TruckIcon, Plus } from 'lucide-react';
import type { Truck } from '../../types';

export function TrucksPage() {
  const { user } = useAuth();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const r = await truckApi.getAll(1, 50); setTrucks(r.data.data.trucks || []); }
      catch {} finally { setIsLoading(false); }
    })();
  }, []);

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div><h1 className="page-title">Trucks</h1><p className="page-subtitle">Manage delivery fleet</p></div>
        {user?.system_role === 'admin' && <button className="btn btn-primary"><Plus size={16} /> Add Truck</button>}
      </div>
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
