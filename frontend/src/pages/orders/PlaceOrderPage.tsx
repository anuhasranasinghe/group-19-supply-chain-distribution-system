// Place Order Page — Customer order creation form
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi, productApi, routeApi } from '../../api/client';
import { formatCurrency } from '../../lib/utils';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';
import type { Product, Route } from '../../types';

export function PlaceOrderPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [address, setAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [routeId, setRouteId] = useState('');
  const [items, setItems] = useState<Array<{ product_id: string; quantity: number }>>([{ product_id: '', quantity: 1 }]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [prodRes, routeRes] = await Promise.all([productApi.getAll(1, 100), routeApi.getAll(1, 100)]);
        setProducts(prodRes.data.data.products || []);
        setRoutes(routeRes.data.data.routes || []);
      } catch { /* data will load once SQL is implemented */ }
    })();
  }, []);

  // Calculate minimum delivery date (today + 7 days)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateStr = minDate.toISOString().split('T')[0];

  const addItem = () => setItems(prev => [...prev, { product_id: '', quantity: 1 }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await orderApi.create({
        delivery_address: address,
        requested_delivery_date: deliveryDate,
        route_id: routeId,
        items: items.filter(i => i.product_id && i.quantity > 0),
      });
      navigate('/orders');
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.product_id);
    return sum + (product ? product.unit_price * item.quantity : 0);
  }, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Place New Order</h1>
        <p className="page-subtitle">Select products and enter delivery details</p>
      </div>

      {error && <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>📦 Order Items</h3>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Product</label>
                <select className="form-select" value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)} required>
                  <option value="">Select product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.unit_price)}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Qty</label>
                <input className="form-input" type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value))} required />
              </div>
              {items.length > 1 && (
                <button type="button" className="btn btn-ghost btn-icon" onClick={() => removeItem(idx)} style={{ color: 'var(--color-danger)' }}><Trash2 size={16} /></button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}><Plus size={14} /> Add Item</button>
          {total > 0 && <p style={{ marginTop: '1rem', fontWeight: 600 }}>Estimated Total: {formatCurrency(total)}</p>}
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>🚚 Delivery Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <div className="form-group">
              <label className="form-label">Delivery Route</label>
              <select className="form-select" value={routeId} onChange={e => setRouteId(e.target.value)} required>
                <option value="">Select route...</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.area_name}{r.store_city ? ` (${r.store_city})` : ''}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Requested Delivery Date</label>
              <input className="form-input" type="date" min={minDateStr} value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} required />
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Must be at least 7 days from today</p>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Delivery Address</label>
            <input className="form-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Full delivery address" required />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            <ShoppingCart size={16} /> {isSubmitting ? 'Placing...' : 'Place Order'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/orders')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
