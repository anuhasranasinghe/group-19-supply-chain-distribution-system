import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportApi } from '../../../api/client';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../../lib/utils';
import { exportToCsv } from './reportUtils';
import {
  ShoppingCart,
  Search,
  Download,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Truck,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
} from 'lucide-react';

interface RawOrderItemRow {
  order_id: string;
  customer_id: string;
  customer_name: string;
  order_date: string;
  requested_delivery_date: string;
  delivery_address: string;
  order_status: string;
  route_id: string;
  route_area: string;
  store_id: string;
  store_name: string;
  store_city: string;
  order_item_id: string;
  product_id: string;
  product_name: string;
  ordered_quantity: number;
  unit_price: number;
  line_total: number;
  delivery_item_id: string | null;
  delivery_quantity: number | null;
  delivery_status: string | null;
  delivered_at: string | null;
  truck_trip_id: string | null;
  truck_trip_status: string | null;
  truck_trip_start_time: string | null;
  truck_trip_end_time: string | null;
  vehicle_no: string | null;
}

interface GroupedOrder {
  order_id: string;
  customer_id: string;
  customer_name: string;
  order_date: string;
  requested_delivery_date: string;
  delivery_address: string;
  order_status: string;
  route_area: string;
  store_name: string;
  store_city: string;
  total_amount: number;
  items: Array<{
    order_item_id: string;
    product_name: string;
    ordered_quantity: number;
    unit_price: number;
    line_total: number;
    delivery_quantity: number | null;
    delivery_status: string | null;
    delivered_at: string | null;
    vehicle_no: string | null;
    truck_trip_status: string | null;
  }>;
}

export function CustomerOrdersReport() {
  const [rawData, setRawData] = useState<RawOrderItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await reportApi.customerOrders();
      setRawData(res.data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load customer order history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const groupedOrders: GroupedOrder[] = useMemo(() => {
    const map = new Map<string, GroupedOrder>();

    for (const row of rawData) {
      if (!map.has(row.order_id)) {
        map.set(row.order_id, {
          order_id: row.order_id,
          customer_id: row.customer_id,
          customer_name: row.customer_name,
          order_date: row.order_date,
          requested_delivery_date: row.requested_delivery_date,
          delivery_address: row.delivery_address,
          order_status: row.order_status,
          route_area: row.route_area,
          store_name: row.store_name,
          store_city: row.store_city,
          total_amount: 0,
          items: [],
        });
      }

      const order = map.get(row.order_id)!;
      // Check if this item is already in list
      const existingItem = order.items.find((i) => i.order_item_id === row.order_item_id);
      if (!existingItem) {
        order.total_amount += row.line_total || 0;
        order.items.push({
          order_item_id: row.order_item_id,
          product_name: row.product_name,
          ordered_quantity: row.ordered_quantity,
          unit_price: row.unit_price,
          line_total: row.line_total,
          delivery_quantity: row.delivery_quantity,
          delivery_status: row.delivery_status,
          delivered_at: row.delivered_at,
          vehicle_no: row.vehicle_no,
          truck_trip_status: row.truck_trip_status,
        });
      }
    }

    return Array.from(map.values());
  }, [rawData]);

  const filteredOrders = useMemo(() => {
    return groupedOrders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.order_status.toLowerCase() === statusFilter.toLowerCase();
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !search ||
        o.customer_name.toLowerCase().includes(search) ||
        o.order_id.toLowerCase().includes(search) ||
        o.store_city.toLowerCase().includes(search) ||
        o.route_area.toLowerCase().includes(search) ||
        o.items.some((i) => i.product_name.toLowerCase().includes(search));

      return matchesStatus && matchesSearch;
    });
  }, [groupedOrders, statusFilter, searchTerm]);

  const filteredFlatRows = useMemo(() => {
    return rawData.filter((r) => {
      const matchesStatus = statusFilter === 'all' || r.order_status.toLowerCase() === statusFilter.toLowerCase();
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !search ||
        r.customer_name.toLowerCase().includes(search) ||
        r.order_id.toLowerCase().includes(search) ||
        r.store_city.toLowerCase().includes(search) ||
        r.route_area.toLowerCase().includes(search) ||
        r.product_name.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [rawData, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const totalOrders = groupedOrders.length;
    const deliveredCount = groupedOrders.filter((o) => o.order_status === 'Delivered').length;
    const totalRevenue = groupedOrders.reduce((acc, o) => acc + o.total_amount, 0);
    const avgOrderVal = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return { totalOrders, deliveredCount, totalRevenue, avgOrderVal };
  }, [groupedOrders]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleExport = () => {
    exportToCsv(
      'customer_order_delivery_history',
      filteredFlatRows.map((row) => ({
        'Order ID': row.order_id,
        Customer: row.customer_name,
        'Order Date': row.order_date ? row.order_date.split('T')[0] : '',
        'Requested Delivery': row.requested_delivery_date
          ? row.requested_delivery_date.split('T')[0]
          : '',
        'Delivery Address': row.delivery_address,
        'Order Status': row.order_status,
        City: row.store_city,
        Route: row.route_area,
        Product: row.product_name,
        'Quantity Ordered': row.ordered_quantity,
        'Unit Price': row.unit_price,
        'Line Total': row.line_total,
        'Delivery Status': row.delivery_status || 'Pending Dispatch',
        'Delivered At': row.delivered_at || '',
        'Assigned Truck': row.vehicle_no || 'Unassigned',
      }))
    );
  };

  return (
    <div>
      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-group">
          <div className="filter-item">
            <Search size={15} style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="filter-input"
              placeholder="Search customer, order, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '220px' }}
            />
          </div>

          <div className="filter-item">
            <span className="filter-label">Status:</span>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          {/* View Toggle */}
          <div style={{ display: 'inline-flex', background: 'var(--color-bg-primary)', padding: '0.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <button
              className={`btn btn-sm ${viewMode === 'grouped' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('grouped')}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              Grouped Orders
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'flat' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('flat')}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              Flat Line Items
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchReport}
            disabled={isLoading}
            title="Refresh Data"
          >
            <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleExport}
            disabled={filteredFlatRows.length === 0}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--color-brand-light)', color: 'var(--color-brand)' }}
          >
            <ShoppingCart size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Total Orders Placed</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.deliveredCount} Delivered</div>
            <div className="stat-label">
              Fulfillment Rate (
              {stats.totalOrders > 0
                ? `${Math.round((stats.deliveredCount / stats.totalOrders) * 100)}%`
                : '0%'}
              )
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
            <div className="stat-label">Cumulative Order Value</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}
          >
            <Package size={22} />
          </div>
          <div>
            <div className="stat-value">{formatCurrency(stats.avgOrderVal)}</div>
            <div className="stat-label">Average Order Total</div>
          </div>
        </div>
      </div>

      {/* Content Rendering: Grouped or Flat */}
      {viewMode === 'grouped' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isLoading ? (
            <div className="loading-container card">
              <div className="spinner" />
              <span>Loading customer order tracking history...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <ShoppingCart className="empty-state-icon" />
                <div className="empty-state-title">No Orders Found</div>
                <p>No customer orders matched your search and filter criteria.</p>
              </div>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = !!expandedOrders[order.order_id];
              return (
                <div
                  key={order.order_id}
                  className="card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    borderColor: isExpanded ? 'var(--color-brand)' : 'var(--color-border)',
                  }}
                >
                  {/* Order Summary Header Bar */}
                  <div
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      cursor: 'pointer',
                      background: isExpanded ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                    }}
                    onClick={() => toggleExpand(order.order_id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.25rem', width: '28px', height: '28px' }}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                            {order.customer_name}
                          </span>
                          <span className={getStatusBadgeClass(order.order_status)}>
                            {order.order_status}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--color-text-muted)',
                            fontFamily: 'var(--font-mono)',
                            marginTop: '0.15rem',
                          }}
                        >
                          Order ID: {order.order_id}
                        </div>
                      </div>
                    </div>

                    {/* Metadata chips */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '1.5rem',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--color-text-muted)' }}>Ordered:</span>{' '}
                        <span style={{ fontWeight: 500 }}>{formatDate(order.order_date)}</span>
                      </div>

                      <div>
                        <span style={{ color: 'var(--color-text-muted)' }}>Delivery Req:</span>{' '}
                        <span style={{ fontWeight: 500 }}>
                          {formatDate(order.requested_delivery_date)}
                        </span>
                      </div>

                      <div>
                        <span style={{ color: 'var(--color-text-muted)' }}>Location:</span>{' '}
                        <span style={{ fontWeight: 500 }}>
                          {order.store_city} ({order.route_area})
                        </span>
                      </div>

                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: 'var(--color-success)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {formatCurrency(order.total_amount)}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Item Breakdown & Delivery Dispatch Info */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '1.25rem 1.5rem',
                        borderTop: '1px solid var(--color-border)',
                        background: 'rgba(15, 23, 42, 0.4)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1.5rem',
                          marginBottom: '1rem',
                          fontSize: '0.8125rem',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MapPin size={14} style={{ color: 'var(--color-brand)' }} />
                          <span>
                            <strong>Delivery Address:</strong> {order.delivery_address}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Truck size={14} style={{ color: '#f59e0b' }} />
                          <span>
                            <strong>Hub Store:</strong> {order.store_name}
                          </span>
                        </div>
                      </div>

                      <table className="data-table" style={{ background: 'var(--color-bg-card)' }}>
                        <thead>
                          <tr>
                            <th>Product Ordered</th>
                            <th style={{ textAlign: 'right' }}>Qty</th>
                            <th style={{ textAlign: 'right' }}>Unit Price</th>
                            <th style={{ textAlign: 'right' }}>Line Total</th>
                            <th>Last-Mile Truck Trip</th>
                            <th style={{ textAlign: 'center' }}>Delivery Status</th>
                            <th>Delivered Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.order_item_id}>
                              <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                                {item.ordered_quantity}
                              </td>
                              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                                {formatCurrency(item.unit_price)}
                              </td>
                              <td
                                style={{
                                  textAlign: 'right',
                                  fontWeight: 600,
                                  color: 'var(--color-success)',
                                  fontFamily: 'var(--font-mono)',
                                }}
                              >
                                {formatCurrency(item.line_total)}
                              </td>
                              <td>
                                {item.vehicle_no ? (
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: '0.8rem',
                                    }}
                                  >
                                    <Truck size={13} style={{ color: 'var(--color-brand)' }} />
                                    {item.vehicle_no} ({item.truck_trip_status || 'Scheduled'})
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                    Awaiting truck dispatch
                                  </span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span
                                  className={getStatusBadgeClass(
                                    item.delivery_status || order.order_status
                                  )}
                                >
                                  {item.delivery_status || order.order_status}
                                </span>
                              </td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                {item.delivered_at ? formatDate(item.delivered_at) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Flat Line Items Table View */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Order Date</th>
                <th>Destination</th>
                <th>Product</th>
                <th style={{ textAlign: 'right' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Total (LKR)</th>
                <th>Assigned Truck</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8}>
                    <div className="loading-container">
                      <div className="spinner" />
                      <span>Loading line items...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredFlatRows.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <ShoppingCart className="empty-state-icon" />
                      <div className="empty-state-title">No Line Items Found</div>
                      <p>No records matched your search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFlatRows.map((row) => (
                  <tr key={`${row.order_id}-${row.order_item_id}`}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{row.customer_name}</div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--color-text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {row.order_id.slice(0, 8)}...
                      </div>
                    </td>
                    <td>{formatDate(row.order_date)}</td>
                    <td>
                      <div>{row.store_city}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {row.route_area}
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{row.product_name}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {row.ordered_quantity}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 600,
                        color: 'var(--color-success)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {formatCurrency(row.line_total)}
                    </td>
                    <td>
                      {row.vehicle_no ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          {row.vehicle_no}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                          Pending
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={getStatusBadgeClass(row.delivery_status || row.order_status)}>
                        {row.delivery_status || row.order_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
