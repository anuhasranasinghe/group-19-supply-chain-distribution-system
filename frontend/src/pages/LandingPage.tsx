// ============================================================
// Landing Page — Enterprise Multimodal SCDS Welcome Portal
// ============================================================
// Interactive, clean landing page showcasing the Rail & Road
// Supply Chain Distribution System for Sri Lanka.
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Train,
  Truck,
  Warehouse,
  Boxes,
  ShieldCheck,
  Clock,
  ArrowRight,
  ChevronRight,
  BarChart3,
  Users,
  MapPin,
  Calendar,
  Sparkles,
  PackageCheck,
  AlertCircle,
  CheckCircle2,
  Zap,
  Database,
  Cpu,
  Layers,
  FileSpreadsheet,
  LogIn,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import './LandingPage.css';

// ------------------------------------------------------------
// Data: Sri Lanka Railway Multimodal Corridors
// ------------------------------------------------------------
interface CityCorridor {
  id: string;
  name: string;
  province: string;
  railDistanceKm: number;
  transitTime: string;
  storeName: string;
  stationLocation: string;
  routes: { name: string; maxTime: string }[];
  activeTrucks: number;
  highlight: string;
}

const CORRIDORS: CityCorridor[] = [
  {
    id: 'colombo',
    name: 'Colombo',
    province: 'Western Province',
    railDistanceKm: 120,
    transitTime: '2h 45m',
    storeName: 'Colombo Central Distribution Store',
    stationLocation: 'Colombo Fort Railway Terminal',
    routes: [
      { name: 'Colombo Fort & Pettah Commercial Hub', maxTime: '1.5 hrs' },
      { name: 'Kollupitiya & Bambalapitiya Coastal', maxTime: '2.0 hrs' },
      { name: 'Dehiwala & Mount Lavinia South', maxTime: '2.5 hrs' },
      { name: 'Rajagiriya & Kotte Administrative', maxTime: '2.0 hrs' }
    ],
    activeTrucks: 8,
    highlight: 'Primary economic and commercial consumption epicenter.'
  },
  {
    id: 'negombo',
    name: 'Negombo',
    province: 'Western Coastal Belt',
    railDistanceKm: 145,
    transitTime: '3h 15m',
    storeName: 'Negombo Regional Hub Store',
    stationLocation: 'Negombo Main Railway Station',
    routes: [
      { name: 'Negombo Town & Coastal Strip', maxTime: '1.5 hrs' },
      { name: 'Katunayake Free Trade Zone (FTZ)', maxTime: '2.0 hrs' },
      { name: 'Kochchikade North Route', maxTime: '2.0 hrs' }
    ],
    activeTrucks: 5,
    highlight: 'Key maritime trade, export processing, and international freight node.'
  },
  {
    id: 'galle',
    name: 'Galle',
    province: 'Southern Province',
    railDistanceKm: 235,
    transitTime: '4h 30m',
    storeName: 'Galle Maritime Depot Store',
    stationLocation: 'Galle Railway Station Yard',
    routes: [
      { name: 'Galle Fort Heritage & Commercial', maxTime: '1.5 hrs' },
      { name: 'Karapitiya Medical & Institutional', maxTime: '2.0 hrs' },
      { name: 'Gintota & Boossa Industrial', maxTime: '2.5 hrs' }
    ],
    activeTrucks: 6,
    highlight: 'Southern industrial, maritime logistics, and hospitality supply line.'
  },
  {
    id: 'matara',
    name: 'Matara',
    province: 'Southern Province',
    railDistanceKm: 275,
    transitTime: '5h 15m',
    storeName: 'Matara Southern Gateway Store',
    stationLocation: 'Matara Railway Station Complex',
    routes: [
      { name: 'Matara Central & Nilwala Basin', maxTime: '1.5 hrs' },
      { name: 'Dondra Southernmost Route', maxTime: '2.0 hrs' },
      { name: 'Weligama Bay Commercial Belt', maxTime: '2.5 hrs' }
    ],
    activeTrucks: 5,
    highlight: 'Strategic terminus connecting the southern economic corridor.'
  },
  {
    id: 'jaffna',
    name: 'Jaffna',
    province: 'Northern Province',
    railDistanceKm: 320,
    transitTime: '6h 30m',
    storeName: 'Jaffna Northern Distribution Center',
    stationLocation: 'Jaffna Main Railway Station',
    routes: [
      { name: 'Jaffna Town & Hospital Road', maxTime: '1.5 hrs' },
      { name: 'Nallur & Kokuvil Corridor', maxTime: '2.0 hrs' },
      { name: 'Chavakachcheri Regional Route', maxTime: '3.0 hrs' }
    ],
    activeTrucks: 6,
    highlight: 'Northern agricultural and high-demand consumer goods gateway.'
  },
  {
    id: 'trincomalee',
    name: 'Trincomalee',
    province: 'Eastern Province',
    railDistanceKm: 185,
    transitTime: '4h 10m',
    storeName: 'Trincomalee Eastern Harbor Store',
    stationLocation: 'Trincomalee Railway Depot',
    routes: [
      { name: 'Inner Harbor & Town Commercial', maxTime: '1.5 hrs' },
      { name: 'China Bay Heavy Industrial Route', maxTime: '2.5 hrs' },
      { name: 'Uppuveli Eastern Coastal', maxTime: '2.0 hrs' }
    ],
    activeTrucks: 4,
    highlight: 'Deep-water harbor access and eastern industrial distribution.'
  }
];

// Product Simulator catalog
const SIM_PRODUCTS = [
  { name: 'Detergent Boxes (24pk)', unitSpace: 0.5, price: 1200 },
  { name: 'Industrial Lubricant Drums', unitSpace: 2.0, price: 14500 },
  { name: 'Premium Ceylon Tea Crates', unitSpace: 0.8, price: 8200 },
  { name: 'Rice & Grains Bulk Sacks', unitSpace: 1.0, price: 4800 },
  { name: 'Packaged Dairy Cartons', unitSpace: 0.4, price: 2100 }
];

export function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State: Interactive Corridor Selection
  const [selectedCityId, setSelectedCityId] = useState<string>('colombo');
  const activeCity = CORRIDORS.find((c) => c.id === selectedCityId) || CORRIDORS[0];

  // State: Interactive Train Allocation Simulator
  const [simProductIndex, setSimProductIndex] = useState<number>(0);
  const [simQuantity, setSimQuantity] = useState<number>(150);
  const [simAdvanceDays, setSimAdvanceDays] = useState<number>(8);
  const trainCapacityLimit = 100.0; // standard fixed train trip capacity units

  const currentSimProduct = SIM_PRODUCTS[simProductIndex];
  const totalSpaceRequired = Number((simQuantity * currentSimProduct.unitSpace).toFixed(1));
  const trip1Allocated = Math.min(totalSpaceRequired, trainCapacityLimit);
  const overflowSpace = Math.max(0, Number((totalSpaceRequired - trainCapacityLimit).toFixed(1)));
  const trip1Percent = Math.min(100, Math.round((totalSpaceRequired / trainCapacityLimit) * 100));

  // State: Interactive Roster Safety Validator
  const [rosterWorkerType, setRosterWorkerType] = useState<'driver' | 'assistant'>('driver');
  const [rosterHours, setRosterHours] = useState<number>(36);
  const [rosterConsecutive, setRosterConsecutive] = useState<number>(1);

  // Roster rule validation:
  // Driver: max 40 hrs/week, 0 consecutive (cannot do 2 consecutive deliveries, so consecutive > 1 is invalid)
  // Assistant: max 60 hrs/week, max 2 consecutive
  const isHoursValid = rosterWorkerType === 'driver' ? rosterHours <= 40 : rosterHours <= 60;
  const isConsecutiveValid =
    rosterWorkerType === 'driver' ? rosterConsecutive <= 1 : rosterConsecutive <= 2;
  const isRosterCompliant = isHoursValid && isConsecutiveValid;

  // State: Role Portal Tabs
  const [activeRoleTab, setActiveRoleTab] = useState<'admin' | 'dispatcher' | 'store_manager' | 'customer'>('dispatcher');

  return (
    <div className="landing-wrapper">
      <div className="landing-grid-overlay" />

      {/* ------------------------------------------------------------
          Enterprise Top Navigation Bar
      ------------------------------------------------------------ */}
      <header className="landing-nav">
        <div className="landing-nav-container">
          <Link to="/" className="landing-brand">
            <div className="brand-icon-box">
              <Train size={20} />
            </div>
            <div className="brand-text">
              <h1>Kandypack SCDS</h1>
              <span className="brand-badge">Sri Lanka Multimodal Logistics</span>
            </div>
          </Link>

          <nav>
            <ul className="landing-nav-links">
              <li><a href="#network" className="landing-nav-link">Network Corridor</a></li>
              <li><a href="#pipeline" className="landing-nav-link">Multimodal Flow</a></li>
              <li><a href="#simulator" className="landing-nav-link">Capacity Simulator</a></li>
              <li><a href="#roster" className="landing-nav-link">Labor Compliance</a></li>
              <li><a href="#roles" className="landing-nav-link">Portals</a></li>
              <li><a href="#reports" className="landing-nav-link">Analytics</a></li>
            </ul>
          </nav>

          <div className="landing-nav-actions">
            {isAuthenticated && user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="user-pill">
                  <span className="user-status-dot" />
                  <span>
                    <strong>{user.name}</strong> ({user.system_role})
                  </span>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-hero-primary"
                  style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}
                >
                  Console Dashboard <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link
                  to="/login"
                  className="btn-hero-secondary"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                >
                  <LogIn size={15} /> Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-hero-primary"
                  style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}
                >
                  Register Customer <ChevronRight size={15} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="landing-content">
        {/* ------------------------------------------------------------
            Hero Section
        ------------------------------------------------------------ */}
        <section className="landing-hero">
          <div className="hero-pill-badge">
            <Sparkles size={14} />
            <span>Sri Lanka Rail & Road Multimodal Distribution Architecture</span>
          </div>

          <h1 className="hero-title">
            Unified Supply Chain & <span className="hero-gradient-text">Multimodal Freight Orchestration</span>
          </h1>

          <p className="hero-subtitle">
            Synchronizing bulk railway cargo from Kandy Central to Sri Lanka's economic hubs via 
            Sri Lanka Railways, integrated with automated last-mile fleet routing, strict labor fatigue 
            rosters, and executive analytics.
          </p>

          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-hero-primary">
                Open Logistics Console <ArrowRight size={16} />
              </Link>
            ) : (
              <Link to="/login" className="btn-hero-primary">
                Enter SCDS Portal <LogIn size={16} />
              </Link>
            )}
            <a href="#simulator" className="btn-hero-secondary">
              <Zap size={16} /> Test Train Capacity Simulator
            </a>
            <a href="#network" className="btn-hero-secondary">
              <MapPin size={16} /> View Rail Corridor Hubs
            </a>
          </div>

          {/* Key Metric Ribbon */}
          <div className="hero-stats-ribbon">
            <div className="hero-stat-card">
              <div className="hero-stat-val">
                <Train size={22} color="#818cf8" /> 6 Hubs
              </div>
              <div className="hero-stat-label">National Rail Terminals</div>
              <div className="hero-stat-desc">Colombo, Negombo, Galle, Matara, Jaffna & Trincomalee</div>
            </div>

            <div className="hero-stat-card">
              <div className="hero-stat-val">
                <ShieldCheck size={22} color="#22c55e" /> 100%
              </div>
              <div className="hero-stat-label">Fatigue Roster Compliance</div>
              <div className="hero-stat-desc">Strict 40h/60h limits & non-consecutive driver protections</div>
            </div>

            <div className="hero-stat-card">
              <div className="hero-stat-val">
                <Calendar size={22} color="#38bdf8" /> 7 Days
              </div>
              <div className="hero-stat-label">Advance Order Guarantee</div>
              <div className="hero-stat-desc">Systematic capacity booking & automated overflow rollover</div>
            </div>

            <div className="hero-stat-card">
              <div className="hero-stat-val">
                <BarChart3 size={22} color="#f59e0b" /> 6 Reports
              </div>
              <div className="hero-stat-label">Executive Intelligence</div>
              <div className="hero-stat-desc">Full quarterly value/volume, route sales, & fleet utilization</div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------
            Interactive Sri Lanka Logistics Network Simulator
        ------------------------------------------------------------ */}
        <section id="network" className="landing-section">
          <div className="section-header">
            <div className="section-tag">
              <MapPin size={12} /> Geographic Footprint
            </div>
            <h2 className="section-title">The Kandy Central Distribution Corridor</h2>
            <p className="section-subtitle">
              Bulk inventory departs from Kandy Distribution Center and travels via Sri Lanka Railways 
              to strategically located station warehouses for regional truck distribution.
            </p>
          </div>

          <div className="corridor-container">
            {/* Sidebar list of destinations */}
            <div className="corridor-sidebar">
              <div className="corridor-origin-badge">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Warehouse size={16} color="#818cf8" />
                  <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>Central Origin Hub</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Kandy Central Distribution Yard • Goods Shed Depot
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0.5rem 0' }}>
                Select Destination Terminal
              </div>

              {CORRIDORS.map((corridor) => (
                <button
                  key={corridor.id}
                  onClick={() => setSelectedCityId(corridor.id)}
                  className={`corridor-city-item ${selectedCityId === corridor.id ? 'active' : ''}`}
                >
                  <div>
                    <div className="corridor-city-name">{corridor.name}</div>
                    <div className="corridor-city-meta">{corridor.province}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#818cf8' }}>
                      {corridor.railDistanceKm} km
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{corridor.transitTime}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Active Destination Detail Panel */}
            <div className="corridor-detail-panel">
              <div>
                <div className="detail-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff' }}>
                        {activeCity.name} Hub Terminal
                      </h3>
                      <span className="badge badge-in-progress" style={{ fontSize: '0.75rem' }}>
                        {activeCity.province}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      {activeCity.highlight}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Railway Line Code</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>
                      SLR-KDY-{activeCity.name.substring(0, 3).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* 3 Metric Summary Boxes */}
                <div className="detail-grid">
                  <div className="detail-box">
                    <div className="detail-box-label">Inter-City Rail Transit</div>
                    <div className="detail-box-value" style={{ color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Train size={18} /> {activeCity.transitTime}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      {activeCity.railDistanceKm} km rail corridor
                    </div>
                  </div>

                  <div className="detail-box">
                    <div className="detail-box-label">Railway Depot Store</div>
                    <div className="detail-box-value" style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                      <Warehouse size={18} /> Station Yard
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      {activeCity.stationLocation}
                    </div>
                  </div>

                  <div className="detail-box">
                    <div className="detail-box-label">Dedicated Delivery Fleet</div>
                    <div className="detail-box-value" style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Truck size={18} /> {activeCity.activeTrucks} Trucks
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      Active rostered teams
                    </div>
                  </div>
                </div>

                {/* Connected Predefined Routes */}
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Layers size={15} color="#818cf8" /> Predefined Last-Mile Routes & Max Delivery Times
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {activeCity.routes.length} mapped areas
                    </span>
                  </div>

                  <div className="route-tags-list">
                    {activeCity.routes.map((route, idx) => (
                      <div key={idx} className="route-tag">
                        <strong>{route.name}</strong>
                        <span style={{ marginLeft: '0.5rem', color: '#f59e0b', fontSize: '0.72rem' }}>
                          (Max: {route.maxTime})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action bar inside detail */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Orders to {activeCity.name} must be reserved at least <strong>7 days in advance</strong>.
                </div>
                <Link
                  to="/orders/new"
                  className="btn btn-primary"
                  style={{ fontSize: '0.8125rem', padding: '0.4rem 0.9rem' }}
                >
                  Schedule Dispatch to {activeCity.name} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------
            Interactive Capacity & Overflow Simulator (SRS Core)
        ------------------------------------------------------------ */}
        <section id="simulator" className="landing-section">
          <div className="section-header">
            <div className="section-tag">
              <Zap size={12} /> Interactive Engineering Demo
            </div>
            <h2 className="section-title">Train Cargo Allocation & Overflow Simulator</h2>
            <p className="section-subtitle">
              Sri Lanka Railways allocates fixed cargo capacity per train trip. Experience how our system
              calculates product space consumption rates and automatically schedules overflow to the next trip.
            </p>
          </div>

          <div className="simulator-box">
            <div className="simulator-controls">
              {/* Product Selector */}
              <div className="sim-control-group">
                <label className="sim-label">Select Cargo Item Type</label>
                <select
                  value={simProductIndex}
                  onChange={(e) => setSimProductIndex(Number(e.target.value))}
                  className="sim-select"
                >
                  {SIM_PRODUCTS.map((prod, idx) => (
                    <option key={idx} value={idx}>
                      {prod.name} ({prod.unitSpace} space units/item)
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Consumption Rate: {currentSimProduct.unitSpace} space units/unit
                </span>
              </div>

              {/* Quantity Input */}
              <div className="sim-control-group">
                <label className="sim-label">Order Quantity (Boxes / Units)</label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  step="10"
                  value={simQuantity}
                  onChange={(e) => setSimQuantity(Math.max(1, Number(e.target.value)))}
                  className="sim-input"
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Estimated Order Value: LKR {(simQuantity * currentSimProduct.price).toLocaleString()}
                </span>
              </div>

              {/* Advance Days Selector */}
              <div className="sim-control-group">
                <label className="sim-label">Lead Time (Days in Advance)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={simAdvanceDays}
                  onChange={(e) => setSimAdvanceDays(Number(e.target.value))}
                  className="sim-input"
                />
                <span style={{ fontSize: '0.72rem', color: simAdvanceDays >= 7 ? '#22c55e' : '#ef4444' }}>
                  {simAdvanceDays >= 7 ? '✓ Meets 7-day advance booking policy' : '⚠️ Must be placed at least 7 days ahead'}
                </span>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="sim-result-card">
              <div style={{ flex: 1, paddingRight: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Train size={18} color="#818cf8" />
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>
                      Intended Train Trip #1 Capacity Utilization
                    </span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: totalSpaceRequired > trainCapacityLimit ? '#f59e0b' : '#22c55e' }}>
                    {totalSpaceRequired} / {trainCapacityLimit} Space Units ({trip1Percent}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="capacity-bar-track">
                  <div
                    className={`capacity-bar-fill ${totalSpaceRequired > trainCapacityLimit ? 'overflow' : ''}`}
                    style={{ width: `${Math.min(100, trip1Percent)}%` }}
                  />
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Allocated to Trip #1</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                      {trip1Allocated} units ({Math.round(trip1Allocated / currentSimProduct.unitSpace)} items)
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Overflow for Trip #2</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: overflowSpace > 0 ? '#ef4444' : '#22c55e' }}>
                      {overflowSpace > 0 ? `${overflowSpace} units (${Math.round(overflowSpace / currentSimProduct.unitSpace)} items)` : '0 units (No Overflow)'}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Advance Notice Status</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: simAdvanceDays >= 7 ? '#22c55e' : '#ef4444' }}>
                      {simAdvanceDays >= 7 ? 'Approved (≥ 7 Days)' : 'Rejected (< 7 Days)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status pill summary */}
              <div style={{ minWidth: '240px', background: 'rgba(30, 41, 59, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Scheduler Action
                </div>
                {overflowSpace > 0 ? (
                  <div style={{ color: '#fbbf24', fontSize: '0.85rem', lineHeight: '1.4' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      <AlertCircle size={16} /> Split Trip Overflow
                    </div>
                    Automated rollover: {trip1Allocated} units loaded on scheduled departure; excess {overflowSpace} units queued on next train.
                  </div>
                ) : (
                  <div style={{ color: '#22c55e', fontSize: '0.85rem', lineHeight: '1.4' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      <CheckCircle2 size={16} /> Full Allocation
                    </div>
                    Complete order fits within single wagon allocation. Scheduled for direct delivery.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------
            Multimodal Operational Pipeline Flow
        ------------------------------------------------------------ */}
        <section id="pipeline" className="landing-section">
          <div className="section-header">
            <div className="section-tag">
              <Layers size={12} /> Execution Lifecycle
            </div>
            <h2 className="section-title">End-to-End Multimodal Logistics Pipeline</h2>
            <p className="section-subtitle">
              How orders seamlessly transition from 7-day advance booking to railway freight, 
              regional store intake, and verified last-mile delivery.
            </p>
          </div>

          <div className="pipeline-grid">
            <div className="pipeline-card">
              <div className="pipeline-step-badge">1</div>
              <div className="pipeline-title">Advance Ordering</div>
              <p className="pipeline-desc">
                Commercial customers submit multi-item orders $\ge$ 7 days in advance. Line items are 
                matched against delivery city and route coverage.
              </p>
            </div>

            <div className="pipeline-card">
              <div className="pipeline-step-badge">2</div>
              <div className="pipeline-title">Train Space Scheduling</div>
              <p className="pipeline-desc">
                Fixed wagon capacity is calculated using product space consumption rates. 
                Overflow automatically spills to subsequent train departures.
              </p>
            </div>

            <div className="pipeline-card">
              <div className="pipeline-step-badge">3</div>
              <div className="pipeline-title">Station Unloading & Intake</div>
              <p className="pipeline-desc">
                Cargo trains arrive at regional railway stations (Colombo, Negombo, Galle, etc.) 
                where store managers log and verify safe unloading.
              </p>
            </div>

            <div className="pipeline-card">
              <div className="pipeline-step-badge">4</div>
              <div className="pipeline-title">Roster-Compliant Dispatch</div>
              <p className="pipeline-desc">
                Trucks are dispatched along predefined routes. Database triggers enforce weekly 
                hour caps (40h/60h) and non-consecutive shift rules.
              </p>
            </div>

            <div className="pipeline-card">
              <div className="pipeline-step-badge">5</div>
              <div className="pipeline-title">Proof of Delivery & Audit</div>
              <p className="pipeline-desc">
                Status automatically shifts from Pending $\to$ Scheduled $\to$ Delivered. 
                Customer histories update, and analytics capture telemetry.
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------
            Interactive Roster & Fatigue Compliance Showcase
        ------------------------------------------------------------ */}
        <section id="roster" className="landing-section">
          <div className="section-header">
            <div className="section-tag">
              <ShieldCheck size={12} /> Workforce Safety
            </div>
            <h2 className="section-title">Strict Roster & Labor Fatigue Protections</h2>
            <p className="section-subtitle">
              Safety is enforced directly at the database engine level via PostgreSQL stored procedures 
              and triggers to prevent driver exhaustion and scheduling conflicts.
            </p>
          </div>

          <div className="roster-grid">
            {/* Driver Rules */}
            <div className="roster-rule-card">
              <div className="roster-rule-header">
                <div className="roster-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  <Users size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Truck Driver Protection Rules</h3>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Primary Heavy Vehicle Operator</span>
                </div>
              </div>

              <ul className="roster-list">
                <li className="roster-item">
                  <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Zero Consecutive Deliveries:</strong> Drivers must not be scheduled for two 
                    consecutive truck deliveries. Mandatory rest interval between dispatches.
                  </div>
                </li>
                <li className="roster-item">
                  <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>40-Hour Weekly Cap:</strong> Cumulative duty hours in any rolling 7-day cycle 
                    cannot exceed 40 hours. Overtime assignments are hard-blocked by database triggers.
                  </div>
                </li>
                <li className="roster-item">
                  <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Zero Double-Booking:</strong> The same driver cannot be assigned to overlapping 
                    route windows or concurrent delivery slots.
                  </div>
                </li>
              </ul>
            </div>

            {/* Assistant Rules */}
            <div className="roster-rule-card">
              <div className="roster-rule-header">
                <div className="roster-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <Users size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Driver Assistant Protection Rules</h3>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Cargo Handling & Co-Pilot Crew</span>
                </div>
              </div>

              <ul className="roster-list">
                <li className="roster-item">
                  <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Max 2 Consecutive Routes:</strong> Assistants can only be scheduled for a maximum 
                    of two consecutive routes before mandatory rest.
                  </div>
                </li>
                <li className="roster-item">
                  <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>60-Hour Weekly Cap:</strong> Cumulative weekly logged hours capped at 60 hours 
                    to ensure alertness during loading and offloading.
                  </div>
                </li>
                <li className="roster-item">
                  <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Synchronous Co-Assignment:</strong> Assistants are locked to the vehicle schedule, 
                    preventing multi-truck conflict overlaps.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Interactive Roster Validator Sandbox */}
          <div className="roster-tester-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Zap size={16} color="#818cf8" />
                <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>Interactive Roster Simulator</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Test how the database validation trigger evaluates crew assignment legality:
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block', marginBottom: '0.25rem' }}>
                  Worker Role
                </label>
                <select
                  value={rosterWorkerType}
                  onChange={(e) => setRosterWorkerType(e.target.value as any)}
                  className="filter-select"
                >
                  <option value="driver">Driver (Cap: 40h, 0 consec)</option>
                  <option value="assistant">Assistant (Cap: 60h, 2 consec)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block', marginBottom: '0.25rem' }}>
                  Logged Weekly Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="80"
                  value={rosterHours}
                  onChange={(e) => setRosterHours(Number(e.target.value))}
                  className="filter-input"
                  style={{ width: '85px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block', marginBottom: '0.25rem' }}>
                  Consecutive Trips
                </label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={rosterConsecutive}
                  onChange={(e) => setRosterConsecutive(Number(e.target.value))}
                  className="filter-input"
                  style={{ width: '75px' }}
                />
              </div>

              <div style={{ minWidth: '180px' }}>
                <label style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block', marginBottom: '0.25rem' }}>
                  Validation Outcome
                </label>
                {isRosterCompliant ? (
                  <span className="badge badge-delivered" style={{ padding: '0.4rem 0.75rem' }}>
                    ✓ DISPATCH APPROVED
                  </span>
                ) : (
                  <span className="badge badge-failed" style={{ padding: '0.4rem 0.75rem' }}>
                    ✗ TRIGGER BLOCKED
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------
            Role-Based Portals Showcase
        ------------------------------------------------------------ */}
        <section id="roles" className="landing-section">
          <div className="section-header">
            <div className="section-tag">
              <Users size={12} /> Access & Workflows
            </div>
            <h2 className="section-title">Tailored Portals for Every Operational Role</h2>
            <p className="section-subtitle">
              SCDS provides dedicated, role-protected interfaces with granular permissions 
              from system administration to field warehouse operations.
            </p>
          </div>

          <div className="role-tabs-bar">
            <button
              onClick={() => setActiveRoleTab('dispatcher')}
              className={`role-tab-btn ${activeRoleTab === 'dispatcher' ? 'active' : ''}`}
            >
              <Train size={16} /> Logistics Dispatcher
            </button>
            <button
              onClick={() => setActiveRoleTab('store_manager')}
              className={`role-tab-btn ${activeRoleTab === 'store_manager' ? 'active' : ''}`}
            >
              <Warehouse size={16} /> Regional Store Manager
            </button>
            <button
              onClick={() => setActiveRoleTab('admin')}
              className={`role-tab-btn ${activeRoleTab === 'admin' ? 'active' : ''}`}
            >
              <ShieldCheck size={16} /> System Administrator
            </button>
            <button
              onClick={() => setActiveRoleTab('customer')}
              className={`role-tab-btn ${activeRoleTab === 'customer' ? 'active' : ''}`}
            >
              <Boxes size={16} /> Commercial Customer
            </button>
          </div>

          {/* Active Role Content Card */}
          <div className="role-display-card">
            <div>
              {activeRoleTab === 'dispatcher' && (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <Train size={16} /> Inter-City Rail & Fleet Command
                  </div>
                  <h3 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.75rem' }}>
                    Train Trips & Bulk Freight Allocator
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                    Dispatchers monitor Sri Lanka Railways cargo trains departing Kandy, allocate wagon space 
                    based on real-time cubic requirements, resolve cargo overflows, and schedule connecting truck dispatches.
                  </p>
                  <ul className="roster-list" style={{ marginBottom: '1.5rem' }}>
                    <li className="roster-item"><CheckCircle2 size={16} color="#818cf8" /> Real-time train trip scheduling across all 6 corridors</li>
                    <li className="roster-item"><CheckCircle2 size={16} color="#818cf8" /> Automated space capacity allocation & overflow tracking</li>
                    <li className="roster-item"><CheckCircle2 size={16} color="#818cf8" /> Master truck fleet status & maintenance tracking</li>
                  </ul>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    Demo Credentials: <code>dispatcher1</code> / <code>password123</code>
                  </div>
                </>
              )}

              {activeRoleTab === 'store_manager' && (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <Warehouse size={16} /> Regional Terminal Depot
                  </div>
                  <h3 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.75rem' }}>
                    Station Warehouses & Local Truck Rosters
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                    Located right beside regional railway stations, store managers inspect incoming train shipments, 
                    manage local buffer inventory, and assign drivers and assistants to predefined delivery routes.
                  </p>
                  <ul className="roster-list" style={{ marginBottom: '1.5rem' }}>
                    <li className="roster-item"><CheckCircle2 size={16} color="#10b981" /> Station cargo arrival verification and line-item intake</li>
                    <li className="roster-item"><CheckCircle2 size={16} color="#10b981" /> Roster allocation with live collision & rest checking</li>
                    <li className="roster-item"><CheckCircle2 size={16} color="#10b981" /> Dispatch execution and delivery completion confirmations</li>
                  </ul>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    Demo Credentials: <code>colombo_mgr</code> / <code>password123</code>
                  </div>
                </>
              )}

              {activeRoleTab === 'admin' && (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <ShieldCheck size={16} /> Governance & Enterprise Intel
                  </div>
                  <h3 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.75rem' }}>
                    Executive Operations & System Audits
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                    Administrators configure regional stores, define delivery routes with maximum transit caps, 
                    provision workforce credentials, and analyze executive quarterly reporting.
                  </p>
                  <ul className="roster-list" style={{ marginBottom: '1.5rem' }}>
                    <li className="roster-item"><CheckCircle2 size={16} color="#f59e0b" /> Access to all 6 SRS Management Reports with CSV exports</li>
                    <li className="roster-item"><CheckCircle2 size={16} color="#f59e0b" /> Store management and route max-delivery-time configuration</li>
                    <li className="roster-item"><CheckCircle2 size={16} color="#f59e0b" /> System-wide user provisioning and role security access</li>
                  </ul>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    Demo Credentials: <code>admin</code> / <code>password123</code>
                  </div>
                </>
              )}

              {activeRoleTab === 'customer' && (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <Boxes size={16} /> B2B Ordering & Tracking
                  </div>
                  <h3 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.75rem' }}>
                    Advance Cargo Booking & Live Tracking
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                    Commercial clients book multi-line freight orders at least 7 days ahead, calculate volume 
                    estimates, review route schedules, and track dispatch stages until delivery confirmation.
                  </p>
                  <ul className="roster-list" style={{ marginBottom: '1.5rem' }}>
                    <li className="roster-item"><CheckCircle2 size={16} color="#38bdf8" /> 7-day advance booking with auto space calculation</li>
                    <li className="roster-item"><CheckCircle2 size={16} color="#38bdf8" /> Transparent order status tracking (Pending $\to$ Delivered)</li>
                    <li className="roster-item"><CheckCircle2 size={16} color="#38bdf8" /> Historical order ledger and delivery receipts</li>
                  </ul>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    Demo Credentials: <code>sunil_perera</code> / <code>password123</code>
                  </div>
                </>
              )}
            </div>

            {/* Interactive Preview Action Card */}
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Sparkles size={28} />
              </div>
              <h4 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                Explore the {activeRoleTab.replace('_', ' ').toUpperCase()} Workflow
              </h4>
              <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Experience role-tailored dashboards, real-time validations, and enterprise data workflows.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link
                  to="/login"
                  className="btn-hero-primary"
                  style={{ justifyContent: 'center' }}
                >
                  Sign In to Experience <ArrowRight size={16} />
                </Link>
                {activeRoleTab === 'customer' && (
                  <Link
                    to="/register"
                    className="btn-hero-secondary"
                    style={{ justifyContent: 'center' }}
                  >
                    Register New Customer Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------
            Executive Reporting Suite Preview
        ------------------------------------------------------------ */}
        <section id="reports" className="landing-section">
          <div className="section-header">
            <div className="section-tag">
              <BarChart3 size={12} /> Executive Intelligence
            </div>
            <h2 className="section-title">The 6 SRS Management Reports</h2>
            <p className="section-subtitle">
              Built directly to specifications with real-time SQL aggregation, dual-axis visualizations, 
              custom date filters, and client-side Excel/CSV export capabilities.
            </p>
          </div>

          <div className="reports-grid">
            <div className="report-preview-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge badge-in-progress">SRS Report #1</span>
                <BarChart3 size={18} color="#818cf8" />
              </div>
              <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.35rem' }}>Quarterly Sales Report</h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.45', marginBottom: '1rem' }}>
                Tracks commercial revenue in LKR alongside total cargo volume dispatched per quarter.
              </p>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.75rem' }}>
                Dual-axis bar charts • AOV • Year/Quarter Filters
              </div>
            </div>

            <div className="report-preview-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge badge-in-progress">SRS Report #2</span>
                <Boxes size={18} color="#22c55e" />
              </div>
              <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.35rem' }}>Most Ordered Items</h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.45', marginBottom: '1rem' }}>
                Quarterly demand ranking of top SKU velocity, total quantities ordered, and revenue contributions.
              </p>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.75rem' }}>
                Rank Badges (Gold/Silver/Bronze) • Demand Share
              </div>
            </div>

            <div className="report-preview-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge badge-in-progress">SRS Report #3</span>
                <MapPin size={18} color="#38bdf8" />
              </div>
              <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.35rem' }}>Geographic Sales Breakdown</h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.45', marginBottom: '1rem' }}>
                City-wise macro revenue distribution and route-wise micro delivery performance within each area.
              </p>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.75rem' }}>
                Dual View Mode • Route Efficiency • Date Filters
              </div>
            </div>

            <div className="report-preview-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge badge-in-progress">SRS Report #4</span>
                <Clock size={18} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.35rem' }}>Worker Working Hours</h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.45', marginBottom: '1rem' }}>
                Full compliance audit tracking Driver (40h) and Assistant (60h) working hours and payroll costs.
              </p>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.75rem' }}>
                Legal Limit Progress Bars • Overtime Alert Badges
              </div>
            </div>

            <div className="report-preview-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge badge-in-progress">SRS Report #5</span>
                <Truck size={18} color="#a855f7" />
              </div>
              <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.35rem' }}>Truck Usage Analysis</h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.45', marginBottom: '1rem' }}>
                Monthly operational review of vehicle active hours, trips completed, and fleet capacity usage.
              </p>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.75rem' }}>
                Vehicle License Utilization • Duty Cycle Metrics
              </div>
            </div>

            <div className="report-preview-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge badge-in-progress">SRS Report #6</span>
                <PackageCheck size={18} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.35rem' }}>Customer Order History</h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.45', marginBottom: '1rem' }}>
                Granular ledger linking customer orders to nested product manifests and last-mile dispatch trucks.
              </p>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.75rem' }}>
                Search & Filter • Truck Plate Details • Delivery Proof
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------
            Enterprise Architecture & Technology Assurance
        ------------------------------------------------------------ */}
        <section className="landing-section">
          <div className="section-header">
            <div className="section-tag">
              <Cpu size={12} /> Tech Stack & Assurance
            </div>
            <h2 className="section-title">Engineered for Robust Enterprise Reliability</h2>
            <p className="section-subtitle">
              Built on battle-tested relational integrity, transactional procedures, and modern containerized architecture.
            </p>
          </div>

          <div className="arch-grid">
            <div className="arch-card">
              <Database size={24} color="#818cf8" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '0.35rem' }}>PostgreSQL 17 Engine</h4>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.45' }}>
                ACID transactions, stored procedures, and triggers ensuring zero double-booking and mandatory rest rules.
              </p>
            </div>

            <div className="arch-card">
              <Cpu size={24} color="#38bdf8" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '0.35rem' }}>Express.js REST API</h4>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.45' }}>
                Typed TypeScript API with JWT HttpOnly security, schema validation, and structured error handling.
              </p>
            </div>

            <div className="arch-card">
              <Layers size={24} color="#22c55e" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '0.35rem' }}>React 19 & Vite</h4>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.45' }}>
                Ultra-fast HMR client with modern dark aesthetics, responsive layout systems, and Recharts telemetry.
              </p>
            </div>

            <div className="arch-card">
              <ShieldCheck size={24} color="#f59e0b" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '0.35rem' }}>Docker Orchestration</h4>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.45' }}>
                Isolated development and production container bridge networks with persistent volume lifecycle management.
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------
            Call to Action Banner
        ------------------------------------------------------------ */}
        <section className="landing-cta">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <Sparkles size={16} /> Ready to Orchestrate Multimodal Logistics?
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Streamline Rail & Road Distribution Across Sri Lanka
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '650px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
            Log in to the console to manage train freight allocations, configure regional truck delivery schedules, 
            or generate comprehensive executive reports.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-hero-primary" style={{ padding: '0.9rem 2rem' }}>
                Launch Console Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-hero-primary" style={{ padding: '0.9rem 2rem' }}>
                  Sign In to SCDS Console <LogIn size={18} />
                </Link>
                <Link to="/register" className="btn-hero-secondary" style={{ padding: '0.9rem 2rem' }}>
                  Register Commercial Customer Account
                </Link>
              </>
            )}
          </div>
        </section>
      </main>

      {/* ------------------------------------------------------------
          Enterprise Footer
      ------------------------------------------------------------ */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-top">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <div className="brand-icon-box" style={{ width: '2rem', height: '2rem' }}>
                  <Train size={16} />
                </div>
                <strong style={{ fontSize: '1.1rem', color: '#ffffff' }}>Kandypack SCDS</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: '1.5', maxWidth: '340px' }}>
                Rail and Road-based Supply Chain Distribution System. Designed for high-volume multimodal 
                logistics across Sri Lanka Railways and regional truck fleets.
              </p>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="user-status-dot" />
                <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>
                  All Systems Operational • PostgreSQL 17 • Express • React 19
                </span>
              </div>
            </div>

            <div>
              <h5 style={{ fontSize: '0.8125rem', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Corridor Hubs
              </h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#94a3b8' }}>
                <li>Colombo Fort Terminal</li>
                <li>Negombo Coastal Hub</li>
                <li>Galle Maritime Yard</li>
                <li>Matara Southern Gateway</li>
                <li>Jaffna Northern Depot</li>
                <li>Trincomalee Harbor Yard</li>
              </ul>
            </div>

            <div>
              <h5 style={{ fontSize: '0.8125rem', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Enterprise Portals
              </h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <li><Link to="/login" style={{ color: '#94a3b8' }}>Dispatcher Console</Link></li>
                <li><Link to="/login" style={{ color: '#94a3b8' }}>Store Manager Portal</Link></li>
                <li><Link to="/login" style={{ color: '#94a3b8' }}>Admin Oversight</Link></li>
                <li><Link to="/orders/new" style={{ color: '#94a3b8' }}>Customer Ordering</Link></li>
                <li><Link to="/reports" style={{ color: '#94a3b8' }}>Executive Reports</Link></li>
              </ul>
            </div>

            <div>
              <h5 style={{ fontSize: '0.8125rem', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Project Specification
              </h5>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: '1.5' }}>
                Built in accordance with the Rail & Road-based Supply Chain Distribution System requirements.
              </p>
              <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.8rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.75rem', color: '#cbd5e1' }}>
                <strong>Group 19</strong> • Academic & Enterprise Demonstration
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div>
              © 2026 Kandypack Supply Chain Distribution System (Group 19). All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#network" style={{ color: '#64748b' }}>Network Map</a>
              <a href="#roster" style={{ color: '#64748b' }}>Labor Rules</a>
              <a href="#reports" style={{ color: '#64748b' }}>SRS Reports</a>
              <Link to="/login" style={{ color: '#64748b' }}>System Sign In</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
