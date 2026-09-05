// ============================================================
// Register Page — Customer Self-Registration
// ============================================================

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', password: '', name: '', city: '',
    street_name: '', postal_code: '', phone_no: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-logo">
          <h1>Create Account</h1>
          <p>Register as a Kandypack customer</p>
        </div>

        {error && (
          <div style={{
            background: 'var(--color-danger-bg)', color: 'var(--color-danger)',
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem', fontSize: '0.8125rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name *</label>
              <input id="reg-name" className="form-input" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Username *</label>
              <input id="reg-username" className="form-input" name="username" value={formData.username} onChange={handleChange} placeholder="johndoe" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password *</label>
            <input id="reg-password" className="form-input" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Min 8 characters" required minLength={8} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-city">City *</label>
              <input id="reg-city" className="form-input" name="city" value={formData.city} onChange={handleChange} placeholder="Colombo" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-postal">Postal Code</label>
              <input id="reg-postal" className="form-input" name="postal_code" value={formData.postal_code} onChange={handleChange} placeholder="10100" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-street">Street Address</label>
            <input id="reg-street" className="form-input" name="street_name" value={formData.street_name} onChange={handleChange} placeholder="123 Main Street" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-phone">Phone Number</label>
            <input id="reg-phone" className="form-input" name="phone_no" value={formData.phone_no} onChange={handleChange} placeholder="+94 77 123 4567" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? (
              <div className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />
            ) : (
              <><UserPlus size={16} /> Create Account</>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
