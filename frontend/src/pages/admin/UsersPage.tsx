import { useState, useEffect } from 'react';
import { userApi } from '../../api/client';
import { Users, Plus } from 'lucide-react';
import { ROLE_LABELS, type User } from '../../types';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    system_role: 'driver',
    hourly_pay: '450.00',
    phone_no: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const r = await userApi.getAll(1, 50);
      setUsers(r.data.data.users || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const isWorkerRole = ['driver', 'assistant', 'store_manager'].includes(formData.system_role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        username: formData.username.trim(),
        password: formData.password,
        name: formData.name.trim(),
        system_role: formData.system_role,
      };

      if (isWorkerRole) {
        payload.worker_type = formData.system_role;
        payload.hourly_pay = parseFloat(formData.hourly_pay) || 400.0;
        if (formData.phone_no.trim()) {
          payload.phone_no = formData.phone_no.trim();
        }
      }

      await userApi.create(payload);
      setShowForm(false);
      setFormData({
        username: '',
        password: '',
        name: '',
        system_role: 'driver',
        hourly_pay: '450.00',
        phone_no: '',
      });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div><h1 className="page-title">User Management</h1><p className="page-subtitle">Manage system users and staff accounts</p></div>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(true); setError(''); }}
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>
          {error}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>Create System Account</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                placeholder="e.g. Kasun Bandara"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Username</label>
              <input
                className="form-input"
                placeholder="e.g. driver_kasun"
                value={formData.username}
                onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Password (min 8 chars)</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">System Role</label>
              <select
                className="form-select"
                value={formData.system_role}
                onChange={e => setFormData(p => ({ ...p, system_role: e.target.value }))}
                required
              >
                {Object.entries(ROLE_LABELS).map(([role, label]) => (
                  <option key={role} value={role}>{label}</option>
                ))}
              </select>
            </div>
            {isWorkerRole && (
              <>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Hourly Pay (LKR)</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="e.g. 500.00"
                    value={formData.hourly_pay}
                    onChange={e => setFormData(p => ({ ...p, hourly_pay: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    placeholder="e.g. 0771234567"
                    value={formData.phone_no}
                    onChange={e => setFormData(p => ({ ...p, phone_no: e.target.value }))}
                  />
                </div>
              </>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'end' }}>
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
