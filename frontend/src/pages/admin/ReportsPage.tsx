import { useState } from 'react';
import {
  TrendingUp,
  Award,
  MapPin,
  Users,
  Truck,
  ShoppingCart,
  BarChart3,
  FileSpreadsheet,
} from 'lucide-react';

import { QuarterlySalesReport } from './reports/QuarterlySalesReport';
import { TopProductsReport } from './reports/TopProductsReport';
import { GeographicSalesReport } from './reports/GeographicSalesReport';
import { WorkerHoursReport } from './reports/WorkerHoursReport';
import { TruckUsageReport } from './reports/TruckUsageReport';
import { CustomerOrdersReport } from './reports/CustomerOrdersReport';

type ReportTab =
  | 'quarterly-sales'
  | 'top-products'
  | 'geo-sales'
  | 'worker-hours'
  | 'truck-usage'
  | 'customer-orders';

interface TabMeta {
  id: ReportTab;
  title: string;
  shortLabel: string;
  desc: string;
  icon: React.ReactNode;
  specNum: string;
}

const REPORT_TABS: TabMeta[] = [
  {
    id: 'quarterly-sales',
    title: 'Quarterly Sales Report',
    shortLabel: 'Quarterly Sales',
    desc: 'Analysis of total revenue (value) and dispatched volume by financial quarter',
    icon: <TrendingUp size={16} />,
    specNum: 'SRS Report #1',
  },
  {
    id: 'top-products',
    title: 'Most-Ordered Items',
    shortLabel: 'Top Products',
    desc: 'Quarterly demand ranking of product lines by order frequency and units',
    icon: <Award size={16} />,
    specNum: 'SRS Report #2',
  },
  {
    id: 'geo-sales',
    title: 'City-wise & Route-wise Sales',
    shortLabel: 'Regional Breakdown',
    desc: 'Sales performance and volume distribution across railway hub cities & delivery routes',
    icon: <MapPin size={16} />,
    specNum: 'SRS Report #3',
  },
  {
    id: 'worker-hours',
    title: 'Driver & Assistant Working Hours',
    shortLabel: 'Worker Hours',
    desc: 'Duty logs, gross wage calculation, and compliance with 40h/60h roster limits',
    icon: <Users size={16} />,
    specNum: 'SRS Report #4',
  },
  {
    id: 'truck-usage',
    title: 'Truck Usage Analysis',
    shortLabel: 'Truck Utilization',
    desc: 'Monthly vehicle fleet utilization, operating duration, and dispatch trip counts',
    icon: <Truck size={16} />,
    specNum: 'SRS Report #5',
  },
  {
    id: 'customer-orders',
    title: 'Customer Order History & Deliveries',
    shortLabel: 'Customer Orders',
    desc: 'Comprehensive order tracking with itemized quantities and last-mile dispatch status',
    icon: <ShoppingCart size={16} />,
    specNum: 'SRS Report #6',
  },
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('quarterly-sales');

  const currentMeta = REPORT_TABS.find((t) => t.id === activeTab) || REPORT_TABS[0];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <div
                className="stat-icon"
                style={{
                  width: '2rem',
                  height: '2rem',
                  background: 'var(--color-brand-light)',
                  color: 'var(--color-brand)',
                }}
              >
                <BarChart3 size={18} />
              </div>
              <h1 className="page-title" style={{ margin: 0, fontSize: '1.6rem' }}>
                Management Reports & Analytics
              </h1>
            </div>
            <p className="page-subtitle">
              Official executive intelligence reports mandated by system requirements
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              className="badge"
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--color-brand-hover)',
                padding: '0.4rem 0.75rem',
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <FileSpreadsheet size={14} />
              {currentMeta.specNum}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="reports-nav" aria-label="Management Reports">
        {REPORT_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`reports-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Active Report Header Banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.4) 100%)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {currentMeta.title}
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
            {currentMeta.desc}
          </p>
        </div>
      </div>

      {/* Report Content Panels */}
      <div>
        {activeTab === 'quarterly-sales' && <QuarterlySalesReport />}
        {activeTab === 'top-products' && <TopProductsReport />}
        {activeTab === 'geo-sales' && <GeographicSalesReport />}
        {activeTab === 'worker-hours' && <WorkerHoursReport />}
        {activeTab === 'truck-usage' && <TruckUsageReport />}
        {activeTab === 'customer-orders' && <CustomerOrdersReport />}
      </div>
    </div>
  );
}
