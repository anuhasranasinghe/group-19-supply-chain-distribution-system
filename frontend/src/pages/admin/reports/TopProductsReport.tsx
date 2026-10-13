import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportApi } from '../../../api/client';
import { formatCurrency } from '../../../lib/utils';
import { exportToCsv, chartTooltipStyle } from './reportUtils';
import {
  Award,
  Package,
  ShoppingCart,
  Download,
  RotateCw,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

interface TopProductRow {
  year: number;
  quarter: number;
  product_id: string;
  product_name: string;
  order_count: number;
  total_quantity: number;
  total_revenue: number;
  product_rank: number;
}

export function TopProductsReport() {
  const [data, setData] = useState<TopProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('4');

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const yearParam = selectedYear ? parseInt(selectedYear, 10) : undefined;
      const quarterParam = selectedQuarter ? parseInt(selectedQuarter, 10) : undefined;

      const res = await reportApi.topProducts(yearParam, quarterParam);
      setData(res.data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load top products report');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedQuarter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const stats = useMemo(() => {
    const totalQty = data.reduce((acc, row) => acc + (row.total_quantity || 0), 0);
    const totalRev = data.reduce((acc, row) => acc + (row.total_revenue || 0), 0);
    const topItem = data.length > 0 ? data[0] : null;
    return { totalQty, totalRev, topItem, productCount: data.length };
  }, [data]);

  const chartData = useMemo(() => {
    return data.slice(0, 8).map((row) => ({
      name:
        row.product_name.length > 20
          ? row.product_name.slice(0, 20) + '...'
          : row.product_name,
      fullName: row.product_name,
      quantity: row.total_quantity,
      revenue: row.total_revenue,
      rank: row.product_rank,
    }));
  }, [data]);

  const handleExport = () => {
    exportToCsv(
      `most_ordered_products_${selectedYear || 'all'}_q${selectedQuarter || 'all'}`,
      data.map((row) => ({
        Rank: row.product_rank,
        'Product Name': row.product_name,
        Year: row.year,
        Quarter: `Q${row.quarter}`,
        'Times Ordered': row.order_count,
        'Total Quantity': row.total_quantity,
        'Total Revenue (LKR)': row.total_revenue,
      }))
    );
  };

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'rank-badge rank-1';
    if (rank === 2) return 'rank-badge rank-2';
    if (rank === 3) return 'rank-badge rank-3';
    return 'rank-badge rank-other';
  };

  return (
    <div>
      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-group">
          <div className="filter-item">
            <Calendar size={15} style={{ color: 'var(--color-text-muted)' }} />
            <span className="filter-label">Year:</span>
            <select
              className="filter-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div className="filter-item">
            <span className="filter-label">Quarter:</span>
            <select
              className="filter-select"
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
            >
              <option value="">All Quarters</option>
              <option value="1">Q1 (Jan - Mar)</option>
              <option value="2">Q2 (Apr - Jun)</option>
              <option value="3">Q3 (Jul - Sep)</option>
              <option value="4">Q4 (Oct - Dec)</option>
            </select>
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
            disabled={data.length === 0}
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
            style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
          >
            <Award size={22} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.3rem' }}>
              {stats.topItem ? stats.topItem.product_name : '—'}
            </div>
            <div className="stat-label">
              #1 Ranked Product ({stats.topItem ? `${stats.topItem.total_quantity} units` : '0'})
            </div>
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
            <div className="stat-value">{stats.totalQty.toLocaleString()} units</div>
            <div className="stat-label">Total Units Dispatched</div>
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
            <div className="stat-label">Top Products Sales Value</div>
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
            <div className="stat-value">{stats.productCount}</div>
            <div className="stat-label">Catalog Products Active</div>
          </div>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      {chartData.length > 0 && (
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">
                <Award size={18} style={{ color: '#f59e0b' }} />
                Product Demand Ranking (Units Ordered)
              </div>
              <div className="chart-subtitle">
                Quarterly volume comparison sorted by demand frequency
              </div>
            </div>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  angle={-15}
                  textAnchor="end"
                  height={45}
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value: any, name: any) => [
                    Number(value).toLocaleString() + ' units',
                    'Total Quantity',
                  ]}
                  labelFormatter={(label: any, payload: any) => {
                    const row = payload?.[0]?.payload;
                    return row ? `${row.fullName} (Rank #${row.rank})` : label;
                  }}
                />
                <Bar dataKey="quantity" name="Quantity" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => {
                    const color =
                      entry.rank === 1
                        ? '#f59e0b'
                        : entry.rank === 2
                          ? '#94a3b8'
                          : entry.rank === 3
                            ? '#d97706'
                            : '#6366f1';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Rank Ordered Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '70px', textAlign: 'center' }}>Rank</th>
              <th>Product Name</th>
              <th>Quarter</th>
              <th style={{ textAlign: 'right' }}>Times Ordered</th>
              <th style={{ textAlign: 'right' }}>Total Units Sold</th>
              <th style={{ textAlign: 'right' }}>Total Sales (LKR)</th>
              <th style={{ textAlign: 'right' }}>Volume Share</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7}>
                  <div className="loading-container">
                    <div className="spinner" />
                    <span>Loading top products ranking...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <Package className="empty-state-icon" />
                    <div className="empty-state-title">No Product Sales Data</div>
                    <p>No orders were completed for the selected quarter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const volShare = stats.totalQty > 0 ? (row.total_quantity / stats.totalQty) * 100 : 0;
                return (
                  <tr key={`${row.product_id}-${row.year}-Q${row.quarter}`}>
                    <td style={{ textAlign: 'center' }}>
                      <span className={getRankBadgeClass(row.product_rank)}>
                        #{row.product_rank}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{row.product_name}</div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--color-text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {row.product_id.slice(0, 8)}...
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-scheduled">
                        Q{row.quarter} {row.year}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {row.order_count}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {row.total_quantity.toLocaleString()}
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
                              width: `${Math.min(volShare, 100)}%`,
                              height: '100%',
                              background: row.product_rank === 1 ? '#f59e0b' : 'var(--color-brand)',
                            }}
                          />
                        </div>
                        {volShare.toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
