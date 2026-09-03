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

  useEffect(() => {
    (async () => {
      try { const r = await storeApi.getAll(1, 50); setStores(r.data.data.stores || []); }
      catch {} finally { setIsLoading(false); }
    })();
  }, []);

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div><h1 className="page-title">Stores</h1><p className="page-subtitle">Manage destination stores</p></div>
        {user?.system_role === 'admin' && <button className="btn btn-primary"><Plus size={16} /> Add Store</button>}
      </div>
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
