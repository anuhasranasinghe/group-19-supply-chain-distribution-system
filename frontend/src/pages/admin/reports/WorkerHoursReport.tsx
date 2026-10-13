import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportApi } from '../../../api/client';
import { formatCurrency } from '../../../lib/utils';
import { exportToCsv, exportToPdf, chartTooltipStyle } from './reportUtils';
import {
  Users,
  Clock,
  Briefcase,
  DollarSign,
  Download,
  Printer,
  RotateCw,
  Calendar,
  CheckCircle2,
  AlertCircle,
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
  Legend,
} from 'recharts';

interface WorkerHoursRow {
  worker_id: string;
  worker_name: string;
  worker_type: 'driver' | 'assistant' | string;
  hourly_pay: number;
  trip_count: number;
  total_hours: number;
}

export function WorkerHoursReport() {
  const [data, setData] = useState<WorkerHoursRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const start = startDate || undefined;
      const end = endDate || undefined;

      const res = await reportApi.workerHours(start, end);
      setData(res.data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load worker hours report');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const filteredData = useMemo(() => {
    if (selectedRole === 'all') return data;
    return data.filter((w) => w.worker_type === selectedRole);
  }, [data, selectedRole]);

  const stats = useMemo(() => {
    const totalHours = filteredData.reduce((acc, row) => acc + (row.total_hours || 0), 0);
    const totalPayroll = filteredData.reduce(
      (acc, row) => acc + (row.total_hours || 0) * (row.hourly_pay || 0),
      0
    );
    const totalTrips = filteredData.reduce((acc, row) => acc + (row.trip_count || 0), 0);
    const avgHours = filteredData.length > 0 ? totalHours / filteredData.length : 0;
    return { totalHours, totalPayroll, totalTrips, avgHours, count: filteredData.length };
  }, [filteredData]);

  const chartData = useMemo(() => {
    return filteredData.map((row) => ({
      name: row.worker_name,
      hours: row.total_hours,
      type: row.worker_type,
      trips: row.trip_count,
    }));
  }, [filteredData]);

  const handleExport = () => {
    exportToCsv(
      `worker_hours_report_${selectedRole}`,
      filteredData.map((row) => ({
        'Worker Name': row.worker_name,
        Role: row.worker_type,
        'Hourly Pay (LKR)': row.hourly_pay,
        'Completed Trips': row.trip_count,
        'Total Hours': row.total_hours,
        'Estimated Payout (LKR)': Math.round((row.total_hours || 0) * (row.hourly_pay || 0)),
      }))
    );
  };

  return (
    <div>
      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-group">
          <div className="filter-item">
            <Briefcase size={15} style={{ color: 'var(--color-text-muted)' }} />
            <span className="filter-label">Role:</span>
            <select
              className="filter-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">All Workers</option>
              <option value="driver">Drivers Only</option>
              <option value="assistant">Assistants Only</option>
            </select>
          </div>

          <div className="filter-item">
            <Calendar size={15} style={{ color: 'var(--color-text-muted)' }} />
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
            disabled={filteredData.length === 0}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => exportToPdf('Worker_Hours')}
            disabled={filteredData.length === 0}
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
            style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.totalHours.toFixed(1)} hrs</div>
            <div className="stat-label">Total Operational Hours</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}
          >
            <DollarSign size={22} />
          </div>
          <div>
            <div className="stat-value">{formatCurrency(stats.totalPayroll)}</div>
            <div className="stat-label">Estimated Labor Cost</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--color-brand-light)', color: 'var(--color-brand)' }}
          >
            <Users size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.count} Staff</div>
            <div className="stat-label">Rostered Personnel</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.avgHours.toFixed(1)} hrs</div>
            <div className="stat-label">Average per Worker</div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">
                <Clock size={18} style={{ color: 'var(--color-brand)' }} />
                Logged Duty Hours by Staff Member
              </div>
              <div className="chart-subtitle">
                Weekly roster limit reference: 40 hrs (Drivers) / 60 hrs (Assistants)
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
                <YAxis
                  stroke="#94a3b8"
                  tickFormatter={(val) => `${val}h`}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value: any, _: any, item: any) => [
                    `${value} hours (${item.payload.trips} trips)`,
                    `${item.payload.type === 'driver' ? 'Driver' : 'Assistant'} Duty`,
                  ]}
                />
                <Bar dataKey="hours" name="Hours Logged" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => {
                    const color = entry.type === 'driver' ? '#3b82f6' : '#8b5cf6';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Worker Name</th>
              <th>Role</th>
              <th style={{ textAlign: 'right' }}>Hourly Rate (LKR)</th>
              <th style={{ textAlign: 'right' }}>Completed Trips</th>
              <th style={{ textAlign: 'right' }}>Duty Hours</th>
              <th style={{ textAlign: 'right' }}>Gross Pay (LKR)</th>
              <th style={{ textAlign: 'center' }}>Weekly Cap Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7}>
                  <div className="loading-container">
                    <div className="spinner" />
                    <span>Loading worker duty hours...</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <Users className="empty-state-icon" />
                    <div className="empty-state-title">No Duty Hours Found</div>
                    <p>No completed truck trips recorded for this selection.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((row) => {
                const maxCap = row.worker_type === 'driver' ? 40 : 60;
                const isNearCap = row.total_hours >= maxCap * 0.85;
                const isOverCap = row.total_hours > maxCap;
                const grossPay = row.total_hours * row.hourly_pay;

                return (
                  <tr key={row.worker_id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{row.worker_name}</div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--color-text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {row.worker_id.slice(0, 8)}...
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background:
                            row.worker_type === 'driver'
                              ? 'rgba(59, 130, 246, 0.15)'
                              : 'rgba(139, 92, 246, 0.15)',
                          color: row.worker_type === 'driver' ? '#60a5fa' : '#c084fc',
                        }}
                      >
                        {row.worker_type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(row.hourly_pay)}/hr
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
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 600,
                        color: 'var(--color-success)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {formatCurrency(grossPay)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isOverCap ? (
                        <span
                          className="badge badge-failed"
                          style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}
                        >
                          <AlertCircle size={12} /> Exceeds {maxCap}h Cap
                        </span>
                      ) : isNearCap ? (
                        <span
                          className="badge badge-pending"
                          style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}
                        >
                          <AlertCircle size={12} /> Near Cap ({row.total_hours.toFixed(0)}/{maxCap}h)
                        </span>
                      ) : (
                        <span
                          className="badge badge-delivered"
                          style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}
                        >
                          <CheckCircle2 size={12} /> Compliant ({row.total_hours.toFixed(0)}/{maxCap}h)
                        </span>
                      )}
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
