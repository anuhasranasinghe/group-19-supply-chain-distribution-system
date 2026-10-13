import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportApi } from '../../../api/client';
import { formatCurrency } from '../../../lib/utils';
import { exportToCsv, exportToPdf, chartTooltipStyle, CHART_COLORS } from './reportUtils';
import {
  MapPin,
  TrendingUp,
  Package,
  ShoppingCart,
  Download,
  Printer,
  RotateCw,
  Calendar,
  Building,
  Route as RouteIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface CitySalesRow {
  city: string;
  route_count: number;
  order_count: number;
  total_units: number;
  total_revenue: number;
}

interface RouteSalesRow {
  route_id: string;
  route_area: string;
  store_id: string;
  store_name: string;
  store_city: string;
  order_count: number;
  total_units: number;
  total_revenue: number;
}

export function GeographicSalesReport() {
  const [viewMode, setViewMode] = useState<'city' | 'route'>('city');
  const [cityData, setCityData] = useState<CitySalesRow[]>([]);
  const [routeData, setRouteData] = useState<RouteSalesRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const start = startDate || undefined;
      const end = endDate || undefined;

      if (viewMode === 'city') {
        const res = await reportApi.citySales(start, end);
        setCityData(res.data.data || []);
      } else {
        const res = await reportApi.routeSales(start, end);
        setRouteData(res.data.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load sales breakdown');
    } finally {
      setIsLoading(false);
    }
  }, [viewMode, startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const stats = useMemo(() => {
    if (viewMode === 'city') {
      const totalRev = cityData.reduce((acc, row) => acc + (row.total_revenue || 0), 0);
      const totalUnits = cityData.reduce((acc, row) => acc + (row.total_units || 0), 0);
      const totalOrders = cityData.reduce((acc, row) => acc + (row.order_count || 0), 0);
      const topEntity = cityData.length > 0 ? cityData[0] : null;
      return { totalRev, totalUnits, totalOrders, topName: topEntity?.city || '—', count: cityData.length };
    } else {
      const totalRev = routeData.reduce((acc, row) => acc + (row.total_revenue || 0), 0);
      const totalUnits = routeData.reduce((acc, row) => acc + (row.total_units || 0), 0);
      const totalOrders = routeData.reduce((acc, row) => acc + (row.order_count || 0), 0);
      const topEntity = routeData.length > 0 ? routeData[0] : null;
      return { totalRev, totalUnits, totalOrders, topName: topEntity?.route_area || '—', count: routeData.length };
    }
  }, [viewMode, cityData, routeData]);

  const pieData = useMemo(() => {
    if (viewMode === 'city') {
      return cityData.map((row) => ({
        name: row.city,
        value: row.total_revenue,
      }));
    } else {
      return routeData.slice(0, 6).map((row) => ({
        name: row.route_area,
        value: row.total_revenue,
      }));
    }
  }, [viewMode, cityData, routeData]);

  const barChartData = useMemo(() => {
    if (viewMode === 'city') {
      return cityData.map((row) => ({
        label: row.city,
        total_revenue: row.total_revenue,
      }));
    } else {
      return routeData.slice(0, 8).map((row) => ({
        label: row.route_area,
        total_revenue: row.total_revenue,
      }));
    }
  }, [viewMode, cityData, routeData]);

  const handleExport = () => {
    if (viewMode === 'city') {
      exportToCsv(
        'city_wise_sales_report',
        cityData.map((row) => ({
          City: row.city,
          'Active Routes': row.route_count,
          'Delivered Orders': row.order_count,
          'Total Units': row.total_units,
          'Total Revenue (LKR)': row.total_revenue,
        }))
      );
    } else {
      exportToCsv(
        'route_wise_sales_report',
        routeData.map((row) => ({
          'Route Area': row.route_area,
          Store: row.store_name,
          City: row.store_city,
          'Delivered Orders': row.order_count,
          'Total Units': row.total_units,
          'Total Revenue (LKR)': row.total_revenue,
        }))
      );
    }
  };

  const handlePreset = (type: 'all' | '30d' | 'ytd') => {
    if (type === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (type === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(new Date().toISOString().split('T')[0]);
    } else if (type === 'ytd') {
      const year = new Date().getFullYear();
      setStartDate(`${year}-01-01`);
      setEndDate(new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <div>
      {/* View Switcher & Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-group">
          {/* Mode Switcher */}
          <div style={{ display: 'inline-flex', background: 'var(--color-bg-primary)', padding: '0.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <button
              className={`btn btn-sm ${viewMode === 'city' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('city')}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              <Building size={14} /> City Breakdown
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'route' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('route')}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              <RouteIcon size={14} /> Route Breakdown
            </button>
          </div>

          <div className="filter-item">
            <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
            <span className="filter-label">From:</span>
            <input
              type="date"
              className="filter-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="filter-item">
            <span className="filter-label">To:</span>
            <input
              type="date"
              className="filter-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => handlePreset('all')}>All</button>
            <button className="btn btn-ghost btn-sm" onClick={() => handlePreset('30d')}>30 Days</button>
            <button className="btn btn-ghost btn-sm" onClick={() => handlePreset('ytd')}>YTD</button>
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
            className="btn btn-secondary btn-sm"
            onClick={handleExport}
            disabled={(viewMode === 'city' ? cityData.length : routeData.length) === 0}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => exportToPdf(`Geographic_${viewMode === 'city' ? 'City' : 'Route'}_Sales`)}
            disabled={(viewMode === 'city' ? cityData.length : routeData.length) === 0}
          >
            <Printer size={14} /> Export PDF
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
            style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}
          >
            <MapPin size={22} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.3rem' }}>{stats.topName}</div>
            <div className="stat-label">Top {viewMode === 'city' ? 'City' : 'Route'} by Sales</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-value">{formatCurrency(stats.totalRev)}</div>
            <div className="stat-label">Total Regional Revenue</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--color-brand-light)', color: 'var(--color-brand)' }}
          >
            <Package size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.totalUnits.toLocaleString()} units</div>
            <div className="stat-label">Cargo Delivered</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}
          >
            <ShoppingCart size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.count} {viewMode === 'city' ? 'Cities' : 'Routes'}</div>
            <div className="stat-label">Active Territories</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      {(viewMode === 'city' ? cityData.length : routeData.length) > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Bar Chart */}
          <div className="chart-card" style={{ marginBottom: 0 }}>
            <div className="chart-header">
              <div>
                <div className="chart-title">
                  <TrendingUp size={18} style={{ color: 'var(--color-brand)' }} />
                  {viewMode === 'city' ? 'Revenue by Destination City' : 'Revenue by Delivery Route'}
                </div>
                <div className="chart-subtitle">Sales contribution breakdown (LKR)</div>
              </div>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart
                  data={barChartData}
                  margin={{ top: 10, right: 20, left: 20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    angle={-15}
                    textAnchor="end"
                    height={40}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tickFormatter={(val) => `LKR ${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Total Sales']}
                  />
                  <Bar dataKey="total_revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="chart-card" style={{ marginBottom: 0 }}>
            <div className="chart-header">
              <div>
                <div className="chart-title">
                  <MapPin size={18} style={{ color: '#22c55e' }} />
                  Regional Market Share Distribution
                </div>
                <div className="chart-subtitle">Proportional sales value share</div>
              </div>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Revenue']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="table-container">
        {viewMode === 'city' ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>City Destination</th>
                <th style={{ textAlign: 'right' }}>Active Routes</th>
                <th style={{ textAlign: 'right' }}>Delivered Orders</th>
                <th style={{ textAlign: 'right' }}>Total Units</th>
                <th style={{ textAlign: 'right' }}>Total Revenue (LKR)</th>
                <th style={{ textAlign: 'right' }}>Market Share</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="loading-container">
                      <div className="spinner" />
                      <span>Loading city sales breakdown...</span>
                    </div>
                  </td>
                </tr>
              ) : cityData.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <MapPin className="empty-state-icon" />
                      <div className="empty-state-title">No City Sales Found</div>
                      <p>No completed orders in the specified date range.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                cityData.map((row) => {
                  const share = stats.totalRev > 0 ? (row.total_revenue / stats.totalRev) * 100 : 0;
                  return (
                    <tr key={row.city}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Building size={14} style={{ color: 'var(--color-brand)' }} />
                          {row.city}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {row.route_count}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {row.order_count}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {row.total_units.toLocaleString()}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 600,
                          color: 'var(--color-success)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {formatCurrency(row.total_revenue)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8rem',
                          }}
                        >
                          <div
                            style={{
                              width: '40px',
                              height: '6px',
                              background: 'var(--color-bg-tertiary)',
                              borderRadius: '3px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(share, 100)}%`,
                                height: '100%',
                                background: 'var(--color-brand)',
                              }}
                            />
                          </div>
                          {share.toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Route Area</th>
                <th>Station Store</th>
                <th>City</th>
                <th style={{ textAlign: 'right' }}>Orders</th>
                <th style={{ textAlign: 'right' }}>Units</th>
                <th style={{ textAlign: 'right' }}>Total Revenue (LKR)</th>
                <th style={{ textAlign: 'right' }}>Route Share</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="loading-container">
                      <div className="spinner" />
                      <span>Loading route sales breakdown...</span>
                    </div>
                  </td>
                </tr>
              ) : routeData.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <RouteIcon className="empty-state-icon" />
                      <div className="empty-state-title">No Route Sales Found</div>
                      <p>No completed orders in the specified date range.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                routeData.map((row) => {
                  const share = stats.totalRev > 0 ? (row.total_revenue / stats.totalRev) * 100 : 0;
                  return (
                    <tr key={row.route_id}>
                      <td style={{ fontWeight: 600 }}>{row.route_area}</td>
                      <td>{row.store_name}</td>
                      <td>
                        <span className="badge badge-scheduled">{row.store_city}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {row.order_count}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {row.total_units.toLocaleString()}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 600,
                          color: 'var(--color-success)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {formatCurrency(row.total_revenue)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8rem',
                          }}
                        >
                          <div
                            style={{
                              width: '40px',
                              height: '6px',
                              background: 'var(--color-bg-tertiary)',
                              borderRadius: '3px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(share, 100)}%`,
                                height: '100%',
                                background: '#22c55e',
                              }}
                            />
                          </div>
                          {share.toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
