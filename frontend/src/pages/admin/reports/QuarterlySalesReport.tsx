import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportApi } from '../../../api/client';
import { formatCurrency } from '../../../lib/utils';
import { exportToCsv, chartTooltipStyle } from './reportUtils';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Download,
  RotateCw,
  BarChart3,
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
  Legend,
} from 'recharts';

interface QuarterlySalesRow {
  year: number;
  quarter: number;
  order_count: number;
  total_volume: number;
  total_revenue: number;
}

export function QuarterlySalesReport() {
  const [data, setData] = useState<QuarterlySalesRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const yearParam = selectedYear ? parseInt(selectedYear, 10) : undefined;
      const quarterParam = selectedQuarter ? parseInt(selectedQuarter, 10) : undefined;

      const res = await reportApi.quarterlySales(yearParam, quarterParam);
      setData(res.data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load quarterly sales report');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedQuarter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const stats = useMemo(() => {
    const totalRev = data.reduce((acc, row) => acc + (row.total_revenue || 0), 0);
    const totalVol = data.reduce((acc, row) => acc + (row.total_volume || 0), 0);
    const totalOrders = data.reduce((acc, row) => acc + (row.order_count || 0), 0);
    const aov = totalOrders > 0 ? totalRev / totalOrders : 0;
    return { totalRev, totalVol, totalOrders, aov };
  }, [data]);

  const chartData = useMemo(() => {
    return [...data]
      .reverse()
      .map((row) => ({
        period: `Q${row.quarter} ${row.year}`,
        revenue: row.total_revenue,
        volume: row.total_volume,
        orders: row.order_count,
      }));
  }, [data]);

  const handleExport = () => {
    exportToCsv(
      `quarterly_sales_report_${selectedYear || 'all'}_q${selectedQuarter || 'all'}`,
      data.map((row) => ({
        Year: row.year,
        Quarter: `Q${row.quarter}`,
        Orders: row.order_count,
        'Volume (Units)': row.total_volume,
        'Revenue (LKR)': row.total_revenue,
        'Avg Order Value (LKR)':
          row.order_count > 0 ? Math.round(row.total_revenue / row.order_count) : 0,
      }))
    );
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
              <option value="2024">2024</option>
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
            style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-value">{formatCurrency(stats.totalRev)}</div>
            <div className="stat-label">Total Revenue (Delivered)</div>
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
            <div className="stat-value">{stats.totalVol.toLocaleString()} units</div>
            <div className="stat-label">Total Cargo Volume</div>
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
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Delivered Orders</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}
          >
            <BarChart3 size={22} />
          </div>
          <div>
            <div className="stat-value">{formatCurrency(stats.aov)}</div>
            <div className="stat-label">Avg Order Value (AOV)</div>
          </div>
        </div>
      </div>

      {/* Visual Chart */}
      {chartData.length > 0 && (
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">
                <BarChart3 size={18} style={{ color: 'var(--color-brand)' }} />
                Quarterly Revenue & Cargo Volume Trends
              </div>
              <div className="chart-subtitle">
                Comparative analysis of sales value (LKR) vs volume dispatched
              </div>
            </div>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                <XAxis dataKey="period" stroke="#94a3b8" />
                <YAxis
                  yAxisId="left"
                  stroke="#6366f1"
                  tickFormatter={(val) => `LKR ${(val / 1000).toFixed(0)}k`}
                />
                <YAxis yAxisId="right" orientation="right" stroke="#22c55e" />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value: any, name: any) => {
                    if (name === 'Revenue (LKR)') return [formatCurrency(Number(value)), name];
                    return [Number(value).toLocaleString() + ' units', name];
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Revenue (LKR)"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="volume"
                  name="Volume (Units)"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Quarter Period</th>
              <th style={{ textAlign: 'right' }}>Orders Count</th>
              <th style={{ textAlign: 'right' }}>Volume (Units)</th>
              <th style={{ textAlign: 'right' }}>Total Revenue (LKR)</th>
              <th style={{ textAlign: 'right' }}>Avg Order Value</th>
              <th style={{ textAlign: 'right' }}>Revenue Share</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6}>
                  <div className="loading-container">
                    <div className="spinner" />
                    <span>Loading quarterly sales data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <BarChart3 className="empty-state-icon" />
                    <div className="empty-state-title">No Sales Data Found</div>
                    <p>No delivered orders match the selected year and quarter filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const share = stats.totalRev > 0 ? (row.total_revenue / stats.totalRev) * 100 : 0;
                const aov = row.order_count > 0 ? row.total_revenue / row.order_count : 0;
                return (
                  <tr key={`${row.year}-Q${row.quarter}`}>
                    <td style={{ fontWeight: 600 }}>
                      <span className="badge badge-scheduled" style={{ marginRight: '0.5rem' }}>
                        Q{row.quarter}
                      </span>
                      {row.year}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {row.order_count}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {row.total_volume.toLocaleString()}
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
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(aov)}
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
      </div>
    </div>
  );
}
