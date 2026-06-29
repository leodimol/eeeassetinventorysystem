import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
  LabelList
} from 'recharts';
import {
  Activity,
  Wrench,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const COLORS = {
  primary: '#c62828',
  secondary: '#10b981',
  warning: '#f97316',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#a855f7',
  pink: '#ec4899'
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.warning,
  COLORS.danger,
  COLORS.info,
  COLORS.purple,
  COLORS.pink
];

// Custom legend renderer that displays values next to labels
const renderCustomLegend = (props) => {
  const { payload } = props;
  return (
    <div className="flex flex-wrap justify-center gap-4 text-sm mt-4">
      {payload && payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass-light)]">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          ></span>
          <span className="text-[var(--text-primary)]">
            {entry.value}: <span className="font-semibold">{entry.payload?.value || 0}</span>
          </span>
        </div>
      ))}
    </div>
  );
};

// Custom animated tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-value" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom label renderer for donut chart segments
const renderCustomLabel = (entry) => {
  return entry.value;
};

// Custom center label component for donut charts
const renderCenterLabel = (cx, cy, total) => {
  return (
    <g>
      <text 
        x={cx} 
        y={cy} 
        textAnchor="middle" 
        dominantBaseline="middle"
        style={{ fontSize: '28px', fontWeight: 'bold', fill: 'var(--text-primary)' }}
      >
        {total}
      </text>
    </g>
  );
};

const AnalyticsDashboard = ({ equipment, filters, compact }) => {
  // Filter equipment based on filters prop
  const filteredEquipment = useMemo(() => {
    if (!filters) return equipment;
    
    return equipment.filter(item => {
      // Status filter
      if (filters.status && item.status !== filters.status) return false;
      
      // Condition filter
      if (filters.condition && item.condition !== filters.condition) return false;
      
      // Hub filter
      if (filters.hub && filters.hub !== 'all' && item.hub_id !== filters.hub) return false;
      
      // Date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const itemDate = new Date(item.purchase_date || item.created_at);
        const now = new Date();
        const days = (now - itemDate) / (24 * 60 * 60 * 1000);
        
        switch (filters.dateRange) {
          case '30days':
            if (days > 30) return false;
            break;
          case '90days':
            if (days > 90) return false;
            break;
          case '1year':
            if (days > 365) return false;
            break;
          default:
            break;
        }
      }
      
      return true;
    });
  }, [equipment, filters]);
  const [activeView, setActiveView] = useState('summary');
  const [hubPage, setHubPage] = useState(1);
  const HUBS_PER_PAGE = 10;

  // Calculate comprehensive metrics
  const comprehensiveMetrics = useMemo(() => {
    const total = filteredEquipment.length;
    const available = filteredEquipment.filter(item => item.status?.toLowerCase() === 'available').length;
    const inUse = filteredEquipment.filter(item => ['in_use', 'loaned', 'active'].includes(item.status?.toLowerCase())).length;
    const maintenance = filteredEquipment.filter(item => ['maintenance', 'damaged'].includes(item.status?.toLowerCase())).length;
    const retired = filteredEquipment.filter(item => item.status?.toLowerCase() === 'retired').length;
    const utilizationRate = total > 0 ? Math.round((inUse / total) * 100) : 0;
    const availabilityRate = total > 0 ? Math.round((available / total) * 100) : 0;
    
    // Warranty metrics
    const warrantyNow = new Date();
    let underWarranty = 0;
    let expiredWarranty = 0;
    let noWarranty = 0;
    
    filteredEquipment.forEach(item => {
      if (!item.warranty_date) {
        noWarranty++;
      } else {
        const warrantyDate = new Date(item.warranty_date);
        if (warrantyDate > warrantyNow) {
          underWarranty++;
        } else {
          expiredWarranty++;
        }
      }
    });
    
    // Condition metrics
    const excellent = filteredEquipment.filter(item => item.condition?.toLowerCase() === 'excellent').length;
    const good = filteredEquipment.filter(item => item.condition?.toLowerCase() === 'good').length;
    const fair = filteredEquipment.filter(item => item.condition?.toLowerCase() === 'fair').length;
    const poor = filteredEquipment.filter(item => item.condition?.toLowerCase() === 'poor').length;
    
    // Assignment metrics
    const assigned = filteredEquipment.filter(item => item.assigned_to && item.assigned_to.trim() !== '').length;
    const unassigned = total - assigned;
    
    // Age metrics
    const ageNow = new Date();
    let totalAge = 0;
    let agedCount = 0;
    
    filteredEquipment.forEach(item => {
      if (item.purchase_date) {
        const age = (ageNow - new Date(item.purchase_date)) / (365 * 24 * 60 * 60 * 1000);
        totalAge += age;
        agedCount++;
      }
    });
    
    const averageAge = agedCount > 0 ? (totalAge / agedCount).toFixed(1) : 0;
    
    return { 
      total, available, inUse, maintenance, retired, 
      utilizationRate, availabilityRate,
      underWarranty, expiredWarranty, noWarranty,
      excellent, good, fair, poor,
      assigned, unassigned, averageAge
    };
  }, [filteredEquipment]);

  // Hub/Location Distribution
  const hubData = useMemo(() => {
    const hubCounts = filteredEquipment.reduce((acc, item) => {
      const hub = item.location || 'Unknown';
      acc[hub] = (acc[hub] || 0) + 1;
      return acc;
    }, {});

    let result = Object.entries(hubCounts).map(([name, value]) => ({
      name: name,
      value,
      color: CHART_COLORS[Object.keys(hubCounts).indexOf(name) % CHART_COLORS.length]
    })).sort((a, b) => b.value - a.value);

    // Apply pagination
    const startIndex = (hubPage - 1) * HUBS_PER_PAGE;
    const endIndex = startIndex + HUBS_PER_PAGE;
    result = result.slice(startIndex, endIndex);

    return result;
  }, [filteredEquipment, hubPage]);

  // Calculate total hub count for pagination
  const totalHubCount = useMemo(() => {
    const hubCounts = filteredEquipment.reduce((acc, item) => {
      const hub = item.location || 'Unknown';
      acc[hub] = (acc[hub] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(hubCounts).length;
  }, [filteredEquipment]);

  const totalHubPages = Math.ceil(totalHubCount / HUBS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => {
    setHubPage(1);
  }, [filters]);

  // Condition Distribution
  const conditionData = useMemo(() => {
    const conditionCounts = filteredEquipment.reduce((acc, item) => {
      const condition = item.condition?.toLowerCase() || 'unknown';
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {});

    let result = Object.entries(conditionCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: CHART_COLORS[Object.keys(conditionCounts).indexOf(name) % CHART_COLORS.length]
    })).sort((a, b) => b.value - a.value);

    return result;
  }, [filteredEquipment]);

  // Asset Type Breakdown
  const assetTypeData = useMemo(() => {
    const typeCounts = filteredEquipment.reduce((acc, item) => {
      const type = item.equipment_type?.toLowerCase() || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    let result = Object.entries(typeCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: CHART_COLORS[Object.keys(typeCounts).indexOf(name) % CHART_COLORS.length]
    })).sort((a, b) => b.value - a.value);

    return result;
  }, [filteredEquipment]);

  // Maintenance Forecasting
  const maintenanceForecast = useMemo(() => {
    const now = new Date();
    let immediate = 0;
    let upcoming = 0;
    let future = 0;

    filteredEquipment.forEach(item => {
      if (!item.purchase_date) return;
      const age = (now - new Date(item.purchase_date)) / (365 * 24 * 60 * 60 * 1000);
      
      if (age >= 5) immediate++;
      else if (age >= 3) upcoming++;
      else if (age >= 1) future++;
    });

    const result = { immediate, upcoming, future };
    return result;
  }, [filteredEquipment]);

  // Asset Age Distribution
  const ageDistribution = useMemo(() => {
    const distribution = {
      '0-1 years': 0,
      '1-2 years': 0,
      '2-3 years': 0,
      '3-5 years': 0,
      '5+ years': 0
    };

    filteredEquipment.forEach(item => {
      if (!item.purchase_date) return;
      const age = (new Date() - new Date(item.purchase_date)) / (365 * 24 * 60 * 60 * 1000);
      
      if (age < 1) distribution['0-1 years']++;
      else if (age < 2) distribution['1-2 years']++;
      else if (age < 3) distribution['2-3 years']++;
      else if (age < 5) distribution['3-5 years']++;
      else distribution['5+ years']++;
    });

    let result = Object.entries(distribution).map(([name, value]) => ({ name, value }));

    return result;
  }, [filteredEquipment]);

  // Recently Added (last 30 days)
  const recentlyAdded = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    return equipment
      .filter(item => {
        const date = new Date(item.purchase_date || item.created_at);
        return date >= thirtyDaysAgo;
      })
      .sort((a, b) => new Date(b.purchase_date || b.created_at) - new Date(a.purchase_date || a.created_at))
      .slice(0, 8);
  }, [equipment]);

  // Category Breakdown
  const categoryData = useMemo(() => {
    const categoryCounts = filteredEquipment.reduce((acc, item) => {
      // Map old office equipment types to 'office' category
      const officeTypes = ['laptop', 'computer', 'desktop', 'monitor', 'printer', 'scanner', 'office'];
      const category = (item.equipment_type || item.category || 'other').toLowerCase();
      const normalizedCategory = officeTypes.includes(category) ? 'office' : category;
      acc[normalizedCategory] = (acc[normalizedCategory] || 0) + 1;
      return acc;
    }, {});

    const categoryLabels = {
      transport: '🚚 Transport',
      logistics: '📦 Logistics',
      office: '🏢 Office',
      other: '📋 Other'
    };

    // Ensure all main categories are always displayed
    const allCategories = ['transport', 'logistics', 'office', 'other'];
    let result = allCategories.map((category) => ({
      name: categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1),
      value: categoryCounts[category] || 0,
      color: CHART_COLORS[allCategories.indexOf(category) % CHART_COLORS.length]
    })).sort((a, b) => b.value - a.value);

    return result;
  }, [filteredEquipment]);

  // Utilization Analysis
  const utilizationData = useMemo(() => {
    const statusCounts = filteredEquipment.reduce((acc, item) => {
      const status = item.status?.toLowerCase() || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    let result = [
      { name: 'Active', value: statusCounts.active || 0, color: COLORS.primary },
      { name: 'Available', value: statusCounts.available || 0, color: COLORS.secondary },
      { name: 'In Use', value: statusCounts.in_use || 0, color: COLORS.info },
      { name: 'Maintenance', value: statusCounts.maintenance || 0, color: COLORS.warning },
      { name: 'Damaged', value: statusCounts.damaged || 0, color: COLORS.danger },
      { name: 'Retired', value: statusCounts.retired || 0, color: COLORS.purple },
      { name: 'Unknown', value: statusCounts.unknown || 0, color: '#6b7280' }
    ].filter(item => item.value > 0);

    return result;
  }, [filteredEquipment]);

  // Recent activity
  const recentActivity = useMemo(() => {
    return equipment
      .filter(item => item.updated_at)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 6);
  }, [equipment]);

  // Top categories
  const topCategories = useMemo(() => {
    return categoryData.slice(0, 4);
  }, [categoryData]);

  // Status distribution for progress bars
  const statusDistribution = useMemo(() => {
    const total = filteredEquipment.length;
    if (total === 0) return [];
    
    return utilizationData.map(item => ({
      ...item,
      percentage: Math.round((item.value / total) * 100)
    }));
  }, [filteredEquipment, utilizationData]);

  // Comprehensive Logistics Dashboard Render
  const renderComprehensiveDashboard = () => (
    <div className="space-y-4">
      {/* KPI Header Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
          <p className="text-[10px] text-white/80 font-medium mb-1">Total Assets</p>
          <p className="text-xl font-bold">{comprehensiveMetrics.total}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-3 text-white">
          <p className="text-[10px] text-white/80 font-medium mb-1">Available</p>
          <p className="text-xl font-bold">{comprehensiveMetrics.available}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-3 text-white">
          <p className="text-[10px] text-white/80 font-medium mb-1">In Use</p>
          <p className="text-xl font-bold">{comprehensiveMetrics.inUse}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
          <p className="text-[10px] text-white/80 font-medium mb-1">Maintenance</p>
          <p className="text-xl font-bold">{comprehensiveMetrics.maintenance}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
          <p className="text-[10px] text-white/80 font-medium mb-1">Utilization</p>
          <p className="text-xl font-bold">{comprehensiveMetrics.utilizationRate}%</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg p-3 text-white">
          <p className="text-[10px] text-white/80 font-medium mb-1">Avg Age</p>
          <p className="text-xl font-bold">{comprehensiveMetrics.averageAge}y</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Distribution */}
          <div className="bg-[var(--bg-glass-light)] rounded-lg p-4 border border-[var(--border-glass)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Category Distribution</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 15, right: 20, left: 15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-tertiary)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--text-tertiary)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <LabelList dataKey="value" position="top" fill="var(--text-primary)" fontSize={11} fontWeight="bold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hub Distribution */}
          <div className="bg-[var(--bg-glass-light)] rounded-lg p-4 border border-[var(--border-glass)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Location Distribution</h3>
              {totalHubPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHubPage(prev => Math.max(prev - 1, 1))}
                    disabled={hubPage === 1}
                    className="p-1 rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    {hubPage} / {totalHubPages}
                  </span>
                  <button
                    onClick={() => setHubPage(prev => Math.min(prev + 1, totalHubPages))}
                    disabled={hubPage === totalHubPages}
                    className="p-1 rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hubData} margin={{ top: 15, right: 20, left: 15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-tertiary)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--text-tertiary)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {hubData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <LabelList dataKey="value" position="top" fill="var(--text-primary)" fontSize={11} fontWeight="bold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status & Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-glass-light)] rounded-lg p-4 border border-[var(--border-glass)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Status Distribution</h3>
              <div className="space-y-2">
                {utilizationData.slice(0, 6).map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs text-[var(--text-primary)]">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{item.value}</span>
                    </div>
                    <div className="h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${comprehensiveMetrics.total > 0 ? (item.value / comprehensiveMetrics.total) * 100 : 0}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--bg-glass-light)] rounded-lg p-4 border border-[var(--border-glass)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Condition Analysis</h3>
              <div className="space-y-2">
                {conditionData.slice(0, 5).map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs text-[var(--text-primary)]">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{item.value}</span>
                    </div>
                    <div className="h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${comprehensiveMetrics.total > 0 ? (item.value / comprehensiveMetrics.total) * 100 : 0}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Lists */}
        <div className="space-y-4">
          {/* Warranty Status */}
          <div className="bg-[var(--bg-glass-light)] rounded-lg p-4 border border-[var(--border-glass)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Warranty Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-xs text-[var(--text-primary)]">Under Warranty</span>
                </div>
                <span className="text-sm font-bold text-emerald-400">{comprehensiveMetrics.underWarranty}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-orange-400" />
                  <span className="text-xs text-[var(--text-primary)]">Expired</span>
                </div>
                <span className="text-sm font-bold text-orange-400">{comprehensiveMetrics.expiredWarranty}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-500/10 border border-gray-500/20">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-gray-400" />
                  <span className="text-xs text-[var(--text-primary)]">No Warranty</span>
                </div>
                <span className="text-sm font-bold text-gray-400">{comprehensiveMetrics.noWarranty}</span>
              </div>
            </div>
          </div>

          {/* Assignment Status */}
          <div className="bg-[var(--bg-glass-light)] rounded-lg p-4 border border-[var(--border-glass)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Assignment Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-indigo-400" />
                  <span className="text-xs text-[var(--text-primary)]">Assigned</span>
                </div>
                <span className="text-sm font-bold text-indigo-400">{comprehensiveMetrics.assigned}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-500/10 border border-gray-500/20">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-gray-400" />
                  <span className="text-xs text-[var(--text-primary)]">Unassigned</span>
                </div>
                <span className="text-sm font-bold text-gray-400">{comprehensiveMetrics.unassigned}</span>
              </div>
            </div>
          </div>

          {/* Maintenance Forecast */}
          <div className="bg-[var(--bg-glass-light)] rounded-lg p-4 border border-[var(--border-glass)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Maintenance Forecast</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  <span className="text-xs text-[var(--text-primary)]">Immediate (5+ years)</span>
                </div>
                <span className="text-sm font-bold text-red-400">{maintenanceForecast.immediate}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-orange-400" />
                  <span className="text-xs text-[var(--text-primary)]">Upcoming (3-5 years)</span>
                </div>
                <span className="text-sm font-bold text-orange-400">{maintenanceForecast.upcoming}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-400" />
                  <span className="text-xs text-[var(--text-primary)]">Future (1-3 years)</span>
                </div>
                <span className="text-sm font-bold text-blue-400">{maintenanceForecast.future}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[var(--bg-glass-light)] rounded-lg p-4 border border-[var(--border-glass)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Recent Activity</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)] text-center py-3">No recent activity</p>
              ) : (
                recentActivity.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-glass)] hover:bg-[var(--bg-tertiary)] transition-all">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white font-bold text-[10px]">
                      {(item.brand || item.model || 'N').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-[var(--text-primary)] truncate">
                        {item.brand} {item.model}
                      </p>
                      <p className="text-[9px] text-[var(--text-tertiary)]">{item.asset_tag || 'No tag'}</p>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      item.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' :
                      item.status === 'active' ? 'bg-indigo-500/20 text-indigo-400' :
                      item.status === 'maintenance' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {item.status || 'Unknown'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Age Distribution & Equipment Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--bg-glass-light)] rounded-lg p-4 border border-[var(--border-glass)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Asset Age Distribution</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDistribution} margin={{ top: 15, right: 20, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--text-tertiary)"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-tertiary)"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill={COLORS.primary} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="value" position="top" fill="var(--text-primary)" fontSize={11} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--bg-glass-light)] rounded-lg p-4 border border-[var(--border-glass)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Equipment Types ({assetTypeData.length})</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetTypeData} margin={{ top: 15, right: 20, left: 15, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--text-tertiary)"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 8 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-tertiary)"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {assetTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="value" position="top" fill="var(--text-primary)" fontSize={11} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Equipment Types Breakdown */}
      <div className="bg-[var(--bg-glass-light)] rounded-lg p-4 border border-[var(--border-glass)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">All Equipment Types Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {assetTypeData.map((type, index) => (
            <div key={index} className="p-3 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)] hover:border-[var(--border-color)] transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: type.color }}
                ></div>
                <span className="text-[10px] text-[var(--text-tertiary)] font-medium">{type.name}</span>
              </div>
              <p className="text-xl font-bold text-[var(--text-primary)]">{type.value}</p>
              <div className="mt-1 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${comprehensiveMetrics.total > 0 ? (type.value / comprehensiveMetrics.total) * 100 : 0}%`,
                    backgroundColor: type.color
                  }}
                ></div>
              </div>
              <p className="text-[9px] text-[var(--text-tertiary)] mt-1">
                {comprehensiveMetrics.total > 0 ? Math.round((type.value / comprehensiveMetrics.total) * 100) : 0}% of total
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Compact mode - just show the donut chart
  if (compact) {
    return (
      <div className="h-full w-full flex flex-col">
        <div className="h-56 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={utilizationData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                label={false}
              >
                {utilizationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="h-20 mt-2 flex items-center justify-center">
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            {utilizationData.map((entry, index) => (
              <div key={`legend-compact-${index}`} className="flex items-center gap-2 px-2 py-1 rounded-md border border-[var(--border-glass)] bg-[var(--bg-glass-light)]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-[var(--text-primary)]">{entry.name}: <span className="font-semibold">{entry.value}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard mode - show comprehensive logistics dashboard
  return renderComprehensiveDashboard();
};

export default AnalyticsDashboard;
