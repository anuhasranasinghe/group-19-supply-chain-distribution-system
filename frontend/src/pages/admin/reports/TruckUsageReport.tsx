import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportApi } from '../../../api/client';
import { exportToCsv, chartTooltipStyle } from './reportUtils';
import {
  Truck,
  Clock,
  Navigation,
  Download,
  RotateCw,
  Calendar,
  Activity,
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

interface TruckUsageRow {
  year: number;
  month: number;
  truck_id: string;
  vehicle_no: string;
  trip_count: number;
  total_hours: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function TruckUsageReport() {
  const [data, setData] = useState<TruckUsageRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const y = selectedYear ? parseInt(selectedYear, 10) : undefined;
      const m = selectedMonth ? parseInt(selectedMonth, 10) : undefined;

      const res = await reportApi.truckUsage(y, m);
      setData(res.data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load truck usage metrics');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const stats = useMemo(() => {
    const totalHours = data.reduce((acc, row) => acc + (row.total_hours || 0), 0);
    const totalTrips = data.reduce((acc, row) => acc + (row.trip_count || 0), 0);
    const uniqueTrucks = new Set(data.map((row) => row.vehicle_no)).size;
    const avgHours = uniqueTrucks > 0 ? totalHours / uniqueTrucks : 0;
    return { totalHours, totalTrips, uniqueTrucks, avgHours };
  }, [data]);

  const chartData = useMemo(() => {
    // Group by vehicle_no if multiple months
    const grouped: Record<string, { vehicle_no: string; hours: number; trips: number }> = {};
    for (const row of data) {
      if (!grouped[row.vehicle_no]) {
        grouped[row.vehicle_no] = { vehicle_no: row.vehicle_no, hours: 0, trips: 0 };
      }
      grouped[row.vehicle_no].hours += row.total_hours;
      grouped[row.vehicle_no].trips += row.trip_count;
    }
    return Object.values(grouped);
  }, [data]);

  const handleExport = () => {
    exportToCsv(
      `truck_usage_report_${selectedYear || 'all'}_m${selectedMonth || 'all'}`,
      data.map((row) => ({
        'Vehicle No': row.vehicle_no,
        Year: row.year,
        Month: MONTH_NAMES[row.month - 1] || row.month,
        'Trips Completed': row.trip_count,
        'Total Hours': row.total_hours,
        'Avg Hours per Trip':
          row.trip_count > 0 ? (row.total_hours / row.trip_count).toFixed(1) : 0,
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
            </select>
          </div>

          <div className="filter-item">
            <span className="filter-label">Month:</span>
            <select
              className="filter-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">All Months</option>
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={String(idx + 1)}>
                  {m}
                </option>
              ))}
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
            style={{ background: 'var(--color-brand-light)', color: 'var(--color-brand)' }}
          >
            <Truck size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.uniqueTrucks} Vehicles</div>
            <div className="stat-label">Active Delivery Fleet</div>
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
            <div className="stat-value">{stats.totalHours.toFixed(1)} hrs</div>
            <div className="stat-label">Total Fleet Hours Logged</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}
          >
            <Navigation size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.totalTrips} Dispatches</div>
            <div className="stat-label">Completed Delivery Trips</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}
          >
            <Activity size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.avgHours.toFixed(1)} hrs</div>
            <div className="stat-label">Average Utilization / Truck</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">
                <Truck size={18} style={{ color: 'var(--color-brand)' }} />
                Monthly Vehicle Utilization Breakdown
              </div>
              <div className="chart-subtitle">Operating duration (hrs) & dispatch trip count</div>
            </div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                <XAxis dataKey="vehicle_no" stroke="#94a3b8" />
                <YAxis yAxisId="left" stroke="#6366f1" tickFormatter={(val) => `${val}h`} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(val: any, name: any) => [
                    name === 'Hours Logged' ? `${val} hrs` : `${val} trips`,
                    name,
                  ]}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="hours"
                  name="Hours Logged"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="trips"
                  name="Trips Completed"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vehicle Number</th>
              <th>Reporting Month</th>
              <th style={{ textAlign: 'right' }}>Completed Trips</th>
              <th style={{ textAlign: 'right' }}>Total Duty Hours</th>
              <th style={{ textAlign: 'right' }}>Avg Hours / Dispatch</th>
              <th style={{ textAlign: 'center' }}>Utilization Profile</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6}>
                  <div className="loading-container">
                    <div className="spinner" />
                    <span>Loading truck utilization data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <Truck className="empty-state-icon" />
                    <div className="empty-state-title">No Truck Utilization Records</div>
                    <p>No logged trips match the selected period.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const avgHoursPerTrip =
                  row.trip_count > 0 ? (row.total_hours / row.trip_count).toFixed(1) : '0';
                return (
                  <tr key={`${row.truck_id}-${row.year}-${row.month}`}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Truck size={15} style={{ color: 'var(--color-brand)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{row.vehicle_no}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-scheduled">
                        {MONTH_NAMES[row.month - 1]} {row.year}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {row.trip_count}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {row.total_hours.toFixed(1)} hrs
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {avgHoursPerTrip} hrs
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(34, 197, 94, 0.15)',
                          color: '#4ade80',
                        }}
                      >
                        Active Operational
                      </span>
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
