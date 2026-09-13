import { BarChart3 } from 'lucide-react';

export function ReportsPage() {
  const reports = [
    { title: 'Quarterly Sales Report', desc: 'Revenue and volume analysis per quarter', endpoint: '/api/reports/quarterly-sales' },
    { title: 'Most-Ordered Products', desc: 'Top products ranked by order frequency', endpoint: '/api/reports/top-products' },
    { title: 'City-wise Breakdown', desc: 'Sales and delivery metrics by city', endpoint: '/api/reports/city-sales' },
    { title: 'Route-wise Breakdown', desc: 'Performance analysis per delivery route', endpoint: '/api/reports/route-sales' },
    { title: 'Worker Hours Report', desc: 'Driver and assistant working hours', endpoint: '/api/reports/worker-hours' },
    { title: 'Truck Usage Report', desc: 'Monthly truck utilization metrics', endpoint: '/api/reports/truck-usage' },
    { title: 'Customer Order History', desc: 'Detailed order history with delivery status', endpoint: '/api/reports/customer-orders' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-subtitle">Business intelligence dashboards — SRS §4.6</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {reports.map((report) => (
          <div className="card" key={report.title} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div className="stat-icon" style={{ background: 'var(--color-brand-light)', color: 'var(--color-brand)' }}>
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.25rem' }}>{report.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{report.desc}</p>
                <code style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{report.endpoint}</code>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
