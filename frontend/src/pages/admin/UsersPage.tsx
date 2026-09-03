import { useState, useEffect } from 'react';
import { userApi } from '../../api/client';
import { Users, Plus } from 'lucide-react';
import { ROLE_LABELS, type User } from '../../types';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const r = await userApi.getAll(1, 50); setUsers(r.data.data.users || []); }
      catch {} finally { setIsLoading(false); }
    })();
  }, []);

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div><h1 className="page-title">User Management</h1><p className="page-subtitle">Manage system users and staff accounts</p></div>
        <button className="btn btn-primary"><Plus size={16} /> Add User</button>
      </div>
      <div className="card">
        {isLoading ? <div className="loading-container"><div className="spinner" /></div>
        : users.length === 0 ? (
          <div className="empty-state"><Users className="empty-state-icon" /><p className="empty-state-title">No users found</p><p>Users will appear once database queries are implemented</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Created</th></tr></thead>
            <tbody>{users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500 }}>{u.name}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{u.username}</td>
                <td><span className="badge badge-in-progress">{ROLE_LABELS[u.system_role]}</span></td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
