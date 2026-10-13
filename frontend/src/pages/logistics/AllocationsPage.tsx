// ============================================================
// Train Allocations Page — Rail Freight Cargo Space Management
// ============================================================
import { useState, useEffect } from 'react';
import { trainAllocationApi, trainTripApi } from '../../api/client';
import { formatDate, formatDateTime, getStatusBadgeClass } from '../../lib/utils';
import { 
  PackageCheck, Plus, Train, Box, Layers, AlertCircle, 
  MapPin, CheckCircle2, ArrowRight, X, Calendar, Clock,
  Gauge, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import type { TrainAllocation, PendingOrderItem, TrainTrip } from '../../types';

export function AllocationsPage() {
  const [allocations, setAllocations] = useState<TrainAllocation[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingOrderItem[]>([]);
  const [trainTrips, setTrainTrips] = useState<TrainTrip[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'allocated' | 'trains'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    order_item_id: '',
    train_trip_id: '',
    quantity_allocated: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [allocRes, pendingRes, tripsRes] = await Promise.allSettled([
        trainAllocationApi.getAll(1, 100),
        trainAllocationApi.getPendingItems(),
        trainTripApi.getAll(1, 100),
      ]);

      if (allocRes.status === 'fulfilled') {
        setAllocations(allocRes.value.data?.data?.allocations || []);
      }
      if (pendingRes.status === 'fulfilled') {
        setPendingItems(pendingRes.value.data?.data?.items || []);
      }
      if (tripsRes.status === 'fulfilled') {
        setTrainTrips(tripsRes.value.data?.data?.trainTrips || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load allocations data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (preselectedItemId?: string) => {
    setModalError('');
    setIsModalOpen(true);

    const targetItem = preselectedItemId 
      ? pendingItems.find(i => i.order_item_id === preselectedItemId)
      : pendingItems[0];

    if (targetItem) {
      const matchingTrip = trainTrips.find(
        t => t.to_city.toLowerCase() === targetItem.destination_city.toLowerCase()
      );
      setFormData({
        order_item_id: targetItem.order_item_id,
        train_trip_id: matchingTrip ? matchingTrip.id : (trainTrips[0]?.id || ''),
        quantity_allocated: String(targetItem.unallocated_quantity),
      });
    } else {
      setFormData({
        order_item_id: '',
        train_trip_id: trainTrips[0]?.id || '',
        quantity_allocated: '',
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalError('');
  };

  const handleItemChange = (itemId: string) => {
    const item = pendingItems.find(i => i.order_item_id === itemId);
    const matchingTrip = item 
      ? trainTrips.find(t => t.to_city.toLowerCase() === item.destination_city.toLowerCase())
      : null;

    setFormData(prev => ({
      ...prev,
      order_item_id: itemId,
      train_trip_id: matchingTrip ? matchingTrip.id : (trainTrips[0]?.id || ''),
      quantity_allocated: item ? String(item.unallocated_quantity) : '',
    }));
  };

  const selectedItem = pendingItems.find(i => i.order_item_id === formData.order_item_id);
  const selectedTrip = trainTrips.find(t => t.id === formData.train_trip_id);

  const isCityMatch = selectedItem && selectedTrip 
    ? selectedItem.destination_city.toLowerCase() === selectedTrip.to_city.toLowerCase()
    : true;

  const matchingTrips = selectedItem
    ? trainTrips.filter(t => t.to_city.toLowerCase() === selectedItem.destination_city.toLowerCase())
    : trainTrips;
  const otherTrips = selectedItem
    ? trainTrips.filter(t => t.to_city.toLowerCase() !== selectedItem.destination_city.toLowerCase())
    : [];

  const enteredQty = parseInt(formData.quantity_allocated || '0', 10);
  const spacePerUnit = selectedItem ? Number(selectedItem.unit_space_consumption) : 0;
  const calculatedSpace = enteredQty > 0 ? (enteredQty * spacePerUnit).toFixed(2) : '0.00';
  const availableTripCapacity = selectedTrip ? Number(selectedTrip.remaining_capacity ?? selectedTrip.max_capacity) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    try {
      if (!formData.order_item_id) {
        throw new Error('Please select an order item to allocate.');
      }
      if (!formData.train_trip_id) {
        throw new Error('Please select a destination train trip.');
      }

      const qty = formData.quantity_allocated ? parseInt(formData.quantity_allocated, 10) : undefined;
      if (qty !== undefined && (isNaN(qty) || qty <= 0)) {
        throw new Error('Quantity must be a positive number.');
      }

      await trainAllocationApi.create({
        order_item_id: formData.order_item_id,
        train_trip_id: formData.train_trip_id,
        quantity_allocated: qty,
      });

      setSuccessMsg('Cargo space successfully allocated to train trip!');
      setIsModalOpen(false);
      fetchData();
      setActiveTab('allocated');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      if (err.details && Array.isArray(err.details) && err.details.length > 0) {
        const detailMsgs = err.details.map((d: any) => d.message || d.field).join(', ');
        setModalError(`${err.message}: ${detailMsgs}`);
      } else {
        setModalError(err.message || 'Failed to allocate order item to train trip.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAllocatedSpace = allocations.reduce((sum, a) => sum + Number(a.allocated_space || 0), 0);

  return (
    <div>
      {/* Page Header */}
      <div className="card-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Train Allocations</h1>
          <p className="page-subtitle">Allocate cargo to rail freight trips & monitor space consumption</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ gap: '0.5rem', display: 'flex', alignItems: 'center' }}>
          <Plus size={16} /> Allocate Cargo to Train
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.25)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Interactive Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div 
          className="card" 
          style={{ 
            padding: '1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            cursor: 'pointer',
            border: activeTab === 'pending' ? '1px solid var(--color-brand)' : '1px solid var(--color-border)',
            transition: 'all var(--transition-fast)'
          }}
          onClick={() => setActiveTab('pending')}
        >
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
            <Box size={22} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontWeight: 600 }}>
              Awaiting Allocation
            </p>
            <h3 style={{ fontSize: '1.625rem', fontWeight: 700, margin: '0.2rem 0 0', color: '#f59e0b' }}>
              {pendingItems.length} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>items</span>
            </h3>
          </div>
        </div>

        <div 
          className="card" 
          style={{ 
            padding: '1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            cursor: 'pointer',
            border: activeTab === 'allocated' ? '1px solid var(--color-brand)' : '1px solid var(--color-border)',
            transition: 'all var(--transition-fast)'
          }}
          onClick={() => setActiveTab('allocated')}
        >
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-brand)' }}>
            <Layers size={22} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontWeight: 600 }}>
              Allocations Completed
            </p>
            <h3 style={{ fontSize: '1.625rem', fontWeight: 700, margin: '0.2rem 0 0' }}>
              {allocations.length}
            </h3>
          </div>
        </div>

        <div 
          className="card" 
          style={{ 
            padding: '1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            cursor: 'pointer',
            border: activeTab === 'trains' ? '1px solid var(--color-brand)' : '1px solid var(--color-border)',
            transition: 'all var(--transition-fast)'
          }}
          onClick={() => setActiveTab('trains')}
        >
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e' }}>
            <Train size={22} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontWeight: 600 }}>
              Available Train Trips
            </p>
            <h3 style={{ fontSize: '1.625rem', fontWeight: 700, margin: '0.2rem 0 0' }}>
              {trainTrips.length} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>schedules</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('pending')}
          style={{ gap: '0.45rem', display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}
        >
          <Box size={16} /> Awaiting Allocation ({pendingItems.length})
        </button>
        <button
          className={`btn ${activeTab === 'allocated' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('allocated')}
          style={{ gap: '0.45rem', display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}
        >
          <PackageCheck size={16} /> Allocated Cargo ({allocations.length})
        </button>
        <button
          className={`btn ${activeTab === 'trains' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('trains')}
          style={{ gap: '0.45rem', display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}
        >
          <Train size={16} /> Train Freight Schedules ({trainTrips.length})
        </button>
      </div>

      {/* Main Content Area Based on Active Tab */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* TAB 1: PENDING ALLOCATIONS */}
        {activeTab === 'pending' && (
          <div>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Box size={18} style={{ color: '#f59e0b' }} />
                  Pending Order Items Awaiting Rail Freight ({pendingItems.length})
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Customer orders ready to be scheduled and loaded onto outbound trains from Kandy Central
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="loading-container" style={{ padding: '3rem' }}>
                <div className="spinner" />
              </div>
            ) : pendingItems.length === 0 ? (
              <div className="empty-state" style={{ padding: '3.5rem 1.5rem' }}>
                <CheckCircle2 className="empty-state-icon" style={{ color: '#22c55e', opacity: 0.8 }} />
                <p className="empty-state-title" style={{ marginTop: '0.75rem', fontWeight: 600 }}>All order cargo is allocated!</p>
                <p style={{ maxWidth: '420px', margin: '0.5rem auto' }}>
                  There are currently no pending orders waiting for rail freight allocation.
                </p>
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Order</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th style={{ textAlign: 'center', width: '120px' }}>Unallocated</th>
                      <th style={{ width: '150px' }}>Space Required</th>
                      <th>Destination Hub</th>
                      <th>Target Date</th>
                      <th style={{ textAlign: 'right', width: '120px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingItems.map(item => (
                      <tr key={item.order_item_id}>
                        <td>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-brand)' }}>
                            #{item.order_id.slice(0, 8)}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {item.customer_name}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{item.product_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Rate: {Number(item.unit_space_consumption).toFixed(2)} space / unit
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f59e0b' }}>
                            {item.unallocated_quantity}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '0.2rem' }}>units</span>
                        </td>
                        <td>
                          <span style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.25rem 0.625rem', 
                            borderRadius: 'var(--radius-full)', 
                            background: 'rgba(245, 158, 11, 0.12)', 
                            color: '#f59e0b',
                            fontWeight: 600,
                            fontSize: '0.8125rem'
                          }}>
                            <Box size={13} />
                            {Number(item.unallocated_space).toFixed(2)} space units
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <MapPin size={14} style={{ color: 'var(--color-brand)' }} />
                            <span style={{ fontWeight: 600 }}>{item.destination_city}</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginLeft: '1.25rem' }}>
                            {item.destination_store_name}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                            {formatDate(item.requested_delivery_date)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenModal(item.order_item_id)}
                            style={{ gap: '0.3rem', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                          >
                            <Train size={13} /> Allocate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACTIVE ALLOCATIONS */}
        {activeTab === 'allocated' && (
          <div>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PackageCheck size={18} style={{ color: 'var(--color-brand)' }} />
                  Active Train Cargo Allocations ({allocations.length})
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Confirmed space reservations assigned to scheduled train departures
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="loading-container" style={{ padding: '3rem' }}>
                <div className="spinner" />
              </div>
            ) : allocations.length === 0 ? (
              <div className="empty-state" style={{ padding: '3.5rem 1.5rem' }}>
                <PackageCheck className="empty-state-icon" style={{ opacity: 0.5 }} />
                <p className="empty-state-title" style={{ marginTop: '0.75rem', fontWeight: 600 }}>No allocations recorded yet</p>
                <p style={{ maxWidth: '420px', margin: '0.5rem auto 1.25rem' }}>
                  Assign pending customer order items to scheduled rail freight departures to reserve train wagon space.
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>
                  <Plus size={14} /> Allocate First Order
                </button>
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Order</th>
                      <th>Product</th>
                      <th style={{ textAlign: 'center', width: '130px' }}>Quantity</th>
                      <th style={{ width: '160px' }}>Space Consumed</th>
                      <th>Train Route</th>
                      <th>Departure Schedule</th>
                      <th>Delivery Target</th>
                      <th style={{ width: '110px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map(alloc => (
                      <tr key={alloc.id}>
                        <td>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-brand)' }}>
                            #{alloc.order_id ? alloc.order_id.slice(0, 8) : 'N/A'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {alloc.product_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                            Rate: {Number(alloc.unit_space_consumption).toFixed(2)} space / unit
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                            {alloc.quantity_allocated}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '0.25rem' }}>units</span>
                        </td>
                        <td>
                          <span style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.3rem 0.65rem', 
                            borderRadius: 'var(--radius-full)', 
                            background: 'rgba(99, 102, 241, 0.1)', 
                            color: 'var(--color-brand)',
                            fontWeight: 600,
                            fontSize: '0.8125rem'
                          }}>
                            <Box size={13} />
                            {Number(alloc.allocated_space).toFixed(2)} units
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500, fontSize: '0.875rem' }}>
                            <Train size={14} style={{ color: 'var(--color-text-muted)' }} />
                            <span>{alloc.from_city || 'Kandy'}</span>
                            <ArrowRight size={13} style={{ color: 'var(--color-text-muted)' }} />
                            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{alloc.to_city}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                            {alloc.trip_date ? formatDate(alloc.trip_date) : '—'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                            Depart: {alloc.departure_time ? new Date(alloc.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                            {alloc.requested_delivery_date ? formatDate(alloc.requested_delivery_date) : '—'}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(alloc.order_status || 'Pending')}>
                            {alloc.order_status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SCHEDULED TRAIN TRIPS */}
        {activeTab === 'trains' && (
          <div>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Train size={18} style={{ color: '#22c55e' }} />
                  Scheduled Freight Train Departures from Kandy ({trainTrips.length})
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Active rail freight trips available for loading cargo to regional destination hubs
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="loading-container" style={{ padding: '3rem' }}>
                <div className="spinner" />
              </div>
            ) : trainTrips.length === 0 ? (
              <div className="empty-state" style={{ padding: '3.5rem 1.5rem' }}>
                <Train className="empty-state-icon" style={{ opacity: 0.5 }} />
                <p className="empty-state-title" style={{ marginTop: '0.75rem', fontWeight: 600 }}>No train departures found</p>
                <p style={{ maxWidth: '420px', margin: '0.5rem auto' }}>
                  Schedule train freight trips in the Train Trips section.
                </p>
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Origin ➔ Destination</th>
                      <th>Trip Date</th>
                      <th>Departure Time</th>
                      <th>Estimated Arrival</th>
                      <th style={{ width: '200px' }}>Cargo Space Available</th>
                      <th style={{ width: '120px' }}>Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainTrips.map(trip => {
                      const avail = Number(trip.remaining_capacity ?? trip.max_capacity);
                      const max = Number(trip.max_capacity);
                      const used = max - avail;
                      const pct = Math.min(100, Math.round((used / max) * 100));

                      return (
                        <tr key={trip.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9375rem' }}>
                              <span>{trip.from_city || 'Kandy'}</span>
                              <ArrowRight size={14} style={{ color: 'var(--color-brand)' }} />
                              <span style={{ color: 'var(--color-brand)' }}>{trip.to_city}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                              {trip.destination_store_name || `${trip.to_city} Regional Hub`}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 500 }}>{formatDate(trip.trip_date)}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
                              <Clock size={13} style={{ color: 'var(--color-text-muted)' }} />
                              <span>{new Date(trip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                              {formatDateTime(trip.arrival_time)}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <strong style={{ color: '#22c55e', fontSize: '0.9375rem' }}>{avail}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>/ {max} units</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: pct > 80 ? '#ef4444' : 'var(--color-brand)', borderRadius: '3px' }} />
                            </div>
                          </td>
                          <td>
                            <span style={{ 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: 'var(--radius-sm)', 
                              background: pct > 80 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
                              color: pct > 80 ? '#ef4444' : 'var(--color-text-secondary)',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              {pct}% used
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clean Allocation Modal Dialog */}
      {isModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={handleCloseModal}
        >
          <div 
            className="card"
            style={{
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-brand)', borderRadius: 'var(--radius-md)' }}>
                  <Train size={20} />
                </div>
                <div>
                  <h3 className="card-title" style={{ fontSize: '1.0625rem', margin: 0 }}>
                    Allocate Order Cargo to Freight Train
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.15rem 0 0' }}>
                    Assign pending line items to scheduled railway departures from Kandy Central
                  </p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={handleCloseModal} title="Close">
                <X size={18} />
              </button>
            </div>

            {/* Modal Error */}
            {modalError && (
              <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                
                {/* Step 1: Select Pending Item */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Box size={14} style={{ color: 'var(--color-brand)' }} /> 1. Select Pending Order Cargo
                  </label>
                  {pendingItems.length === 0 ? (
                    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px dashed var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.8125rem', textAlign: 'center' }}>
                      All current orders are already allocated to train trips.
                    </div>
                  ) : (
                    <select
                      className="form-select"
                      value={formData.order_item_id}
                      onChange={e => handleItemChange(e.target.value)}
                      required
                      style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
                    >
                      <option value="">Select an order item...</option>
                      {pendingItems.map(item => (
                        <option key={item.order_item_id} value={item.order_item_id}>
                          #{item.order_id.slice(0, 8)} • {item.customer_name} — {item.product_name} ({item.unallocated_quantity} unallocated ➔ {item.destination_city})
                        </option>
                      ))}
                    </select>
                  )}

                  {selectedItem && (
                    <div style={{
                      marginTop: '0.45rem',
                      padding: '0.55rem 0.8rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.4rem 0.875rem',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} style={{ color: 'var(--color-brand)' }} />
                        <span style={{ color: 'var(--color-text-muted)' }}>Hub:</span>
                        <strong>{selectedItem.destination_city}</strong>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>({selectedItem.destination_store_name})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} style={{ color: 'var(--color-text-muted)' }} />
                        <span style={{ color: 'var(--color-text-muted)' }}>Target:</span>
                        <strong>{formatDate(selectedItem.requested_delivery_date)}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Box size={13} style={{ color: '#f59e0b' }} />
                        <span style={{ color: 'var(--color-text-muted)' }}>Space:</span>
                        <strong style={{ color: '#f59e0b' }}>{Number(selectedItem.unallocated_space).toFixed(1)} units</strong>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>({selectedItem.unallocated_quantity} qty)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2: Select Matching Train Trip */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Train size={14} style={{ color: 'var(--color-brand)' }} /> 2. Scheduled Freight Train Departure
                  </label>
                  <select
                    className="form-select"
                    value={formData.train_trip_id}
                    onChange={e => setFormData(p => ({ ...p, train_trip_id: e.target.value }))}
                    required
                    style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
                  >
                    <option value="">Select a train trip...</option>
                    {matchingTrips.length > 0 && (
                      <optgroup label={`Recommended Trips heading to ${selectedItem ? selectedItem.destination_city : 'Destination'}`}>
                        {matchingTrips.map(trip => (
                          <option key={trip.id} value={trip.id}>
                            {trip.from_city} ➔ {trip.to_city} | {formatDate(trip.trip_date)} (Depart: {new Date(trip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}) — Available: {trip.remaining_capacity ?? trip.max_capacity} space
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {otherTrips.length > 0 && (
                      <optgroup label="Other Destination Trips">
                        {otherTrips.map(trip => (
                          <option key={trip.id} value={trip.id}>
                            {trip.from_city} ➔ {trip.to_city} | {formatDate(trip.trip_date)} — Available: {trip.remaining_capacity ?? trip.max_capacity} space
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>

                  {selectedTrip && (
                    <div style={{
                      marginTop: '0.45rem',
                      padding: '0.55rem 0.8rem',
                      background: isCityMatch ? 'rgba(34, 197, 94, 0.04)' : 'rgba(239, 68, 68, 0.06)',
                      border: `1px solid ${isCityMatch ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.3)'}`,
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.4rem 0.875rem',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Train size={13} style={{ color: isCityMatch ? '#22c55e' : '#ef4444' }} />
                        <span>{selectedTrip.from_city} ➔ <strong>{selectedTrip.to_city}</strong></span>
                        {!isCityMatch && (
                          <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <AlertTriangle size={11} /> Mismatch with {selectedItem?.destination_city}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={13} style={{ color: 'var(--color-text-muted)' }} />
                        <span>Depart: <strong>{formatDate(selectedTrip.trip_date)}, {new Date(selectedTrip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Gauge size={13} style={{ color: '#22c55e' }} />
                        <span>Available: <strong style={{ color: '#22c55e' }}>{availableTripCapacity}</strong> / {selectedTrip.max_capacity} space</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 3: Quantity & Space Impact */}
                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8125rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Gauge size={14} style={{ color: 'var(--color-brand)' }} /> 3. Quantity to Allocate
                    </label>
                    {selectedItem && (
                      <button 
                        type="button" 
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.1rem 0.45rem', color: 'var(--color-brand)' }}
                        onClick={() => setFormData(p => ({ ...p, quantity_allocated: String(selectedItem.unallocated_quantity) }))}
                      >
                        Allocate All ({selectedItem.unallocated_quantity})
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      max={selectedItem?.unallocated_quantity || undefined}
                      value={formData.quantity_allocated}
                      onChange={e => setFormData(p => ({ ...p, quantity_allocated: e.target.value }))}
                      placeholder="e.g. 10"
                      required
                      style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0.5rem 0.75rem' }}
                    />
                    <div style={{ padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--color-border)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      Space Impact: <strong style={{ color: 'var(--color-brand)' }}>{calculatedSpace} units</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm" 
                  disabled={isSubmitting || !formData.order_item_id || !formData.train_trip_id}
                  style={{ gap: '0.4rem', display: 'flex', alignItems: 'center' }}
                >
                  <PackageCheck size={15} />
                  {isSubmitting ? 'Allocating Cargo...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
