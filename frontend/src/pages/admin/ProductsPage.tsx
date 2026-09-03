// ============================================================
// Products Page — Product Catalog Management
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../../api/client';
import { formatCurrency } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import type { Product } from '../../types';

export function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', unit_price: '', unit_space_consumption: '' });

  const isAdmin = user?.system_role === 'admin';

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await productApi.getAll(1, 100);
      setProducts(response.data.data.products || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        unit_price: parseFloat(formData.unit_price),
        unit_space_consumption: parseFloat(formData.unit_space_consumption),
      };
      if (editingProduct) {
        await productApi.update(editingProduct.id, data);
      } else {
        await productApi.create(data);
      }
      setShowForm(false);
      setEditingProduct(null);
      setFormData({ name: '', unit_price: '', unit_space_consumption: '' });
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      unit_price: String(product.unit_price),
      unit_space_consumption: String(product.unit_space_consumption),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.delete(id);
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage the Kandypack product catalogue</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingProduct(null); setFormData({ name: '', unit_price: '', unit_space_consumption: '' }); }}>
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      {error && <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>{error}</div>}

      {showForm && isAdmin && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>{editingProduct ? 'Edit Product' : 'New Product'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Name</label>
              <input className="form-input" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Unit Price (LKR)</label>
              <input className="form-input" type="number" step="0.01" min="0.01" value={formData.unit_price} onChange={e => setFormData(p => ({ ...p, unit_price: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Space Consumption</label>
              <input className="form-input" type="number" step="0.0001" min="0.0001" value={formData.unit_space_consumption} onChange={e => setFormData(p => ({ ...p, unit_space_consumption: e.target.value }))} required />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary btn-sm">Save</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {isLoading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package className="empty-state-icon" />
            <p className="empty-state-title">No products found</p>
            <p>Add products to the catalogue to get started</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Unit Price</th>
                <th>Space/Unit</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td style={{ fontWeight: 500 }}>{product.name}</td>
                  <td>{formatCurrency(product.unit_price)}</td>
                  <td>{product.unit_space_consumption}</td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleEdit(product)} title="Edit"><Pencil size={14} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(product.id)} title="Delete" style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
