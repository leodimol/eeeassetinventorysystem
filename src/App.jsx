 import React, { useState, useMemo, useRef, useEffect } from 'react'; // Force cache bust
import { supabase } from './lib/supabase';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import ConfirmDialog from './components/ui/ConfirmDialog';
import {
  LayoutDashboard,
  Laptop,
  MousePointer2,
  Printer,
  Scan,
  Search,
  Plus,
  Bell,
  Settings,
  RefreshCw,
  FileDown,
  FileUp,
  Filter,
  Trash2,
  Database,
  AlertCircle,
  Monitor,
  Eye,
  Palette,
  X,
  Maximize2,
  Minimize2,
  Command,
  Activity,
  Clock,
  Edit3,
  TrendingUp,
  TrendingDown,
  Wrench,
  History,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  CheckCircle,
  AlertTriangle,
  Info,
  LogOut,
  Package
} from 'lucide-react';
import LoadingScreen from './components/LoadingScreen';
import { Button, Card, Input, Modal } from './components/ui/Base';
import EquipmentModal from './components/AddAssetModal';
import EquipmentHistoryModal from './components/AssetHistoryModal';
import { useEquipment, useEquipmentStats, useDeletedAssets } from './hooks/useData';
import { useTheme, themes } from './context/ThemeContext';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Toast from './components/ui/Toast';

const Sidebar = ({ activePage, setActivePage, inventoryCount, effectiveTheme, isCollapsed, onToggle, onLogout, isMobile, onCloseMobile, alerts }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'inventory', label: 'Asset', icon: <Package size={20} />, badge: inventoryCount > 0 ? inventoryCount : null },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, badge: alerts?.unreadCount > 0 ? alerts.unreadCount : null },
  ];

  const adminItems = [
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div
      className={`flex flex-col h-screen shrink-0 glass-sidebar transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} ${isMobile ? 'backdrop-blur-xl' : ''}`}
      style={{ background: 'var(--bg-glass)' }}
    >
      <div className="p-4 border-b border-[var(--border-glass)] flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
          <img
            src="/sidebar.logo.png"
            alt="Logo"
            className="w-12 h-12 object-contain"
          />
        </div>
        {!isCollapsed && (
          <div className="flex-1">
            <h1 className="font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>Asset Inventory</h1>
            <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-tertiary)' }}>System</p>
          </div>
        )}
        <div className="relative flex-shrink-0 ml-auto hidden lg:block">
          <button
            onClick={onToggle}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="p-3 rounded-lg transition-all duration-300 hover:scale-110"
            style={{
              color: 'var(--text-secondary)',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(99, 102, 241, 0.12))',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.15)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(99, 102, 241, 0.18))';
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(59, 130, 246, 0.35), 0 6px 20px rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(99, 102, 241, 0.12))';
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.25)';
            }}
          >
            {isCollapsed ? (
              <ChevronRight size={20} strokeWidth={2} />
            ) : (
              <ChevronLeft size={20} strokeWidth={2} />
            )}
          </button>
          {showTooltip && (
            <div className="sidebar-tooltip">
              {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </div>
          )}
        </div>
        {isMobile && (
          <button
            onClick={onCloseMobile}
            className="p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-110 active:scale-95 lg:hidden"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6 modern-scroll" style={{ overflow: 'visible' }}>
        <div>
          {!isCollapsed && (
            <p className="text-[10px] uppercase tracking-widest font-bold mb-3 px-3" style={{ color: 'var(--text-tertiary)' }}>Main Menu</p>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item.id} className="relative" style={{ overflow: 'visible' }}>
                <button
                  onClick={() => setActivePage(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all duration-200 group ${
                    activePage === item.id
                      ? ''
                      : 'hover:bg-white/5'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  style={activePage === item.id ? {
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                    color: 'white'
                  } : {
                    color: 'var(--text-primary)'
                  }}
                >
                  <div className="flex items-center justify-center w-6 h-6" style={{ color: activePage === item.id ? 'white' : 'var(--accent-tertiary)' }}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.badge && (
                        <span
                          className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full animate-pulse"
                          style={{
                            background: item.id === 'notifications' ? 'var(--accent-orange)' : (activePage === item.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)'),
                            color: item.id === 'notifications' ? 'white' : (activePage === item.id ? 'white' : 'var(--text-secondary)'),
                            boxShadow: item.id === 'notifications' ? '0 0 8px rgba(251, 191, 36, 0.4)' : 'none'
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
                {isCollapsed && hoveredItem === item.id && (
                  <div className="sidebar-tooltip">
                    {item.label}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div>
          {!isCollapsed && (
            <p className="text-[10px] uppercase tracking-widest font-bold mb-3 px-3" style={{ color: 'var(--text-tertiary)' }}>Admin</p>
          )}
          <nav className="space-y-1">
            {adminItems.map((item) => (
              <div key={item.id} className="relative" style={{ overflow: 'visible' }}>
                <button
                  onClick={() => setActivePage(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all duration-200 group ${
                    activePage === item.id 
                      ? '' 
                      : 'hover:bg-white/5'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  style={activePage === item.id ? {
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                    color: 'white'
                  } : {
                    color: 'var(--text-primary)'
                  }}
                >
                  <div className="flex items-center justify-center w-6 h-6" style={{ color: activePage === item.id ? 'white' : 'var(--accent-tertiary)' }}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </button>
                {isCollapsed && hoveredItem === item.id && (
                  <div className="sidebar-tooltip">
                    {item.label}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-4 mt-auto">
        {!isCollapsed ? (
          <div
            className="rounded-[16px] p-4"
            style={{
              background: 'var(--bg-glass-light)',
              border: '1px solid var(--border-glass)'
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Database size={16} strokeWidth={2} style={{ color: 'var(--accent-primary)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Database</span>
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)' }}
              ></div>
            </div>
            <p className="text-[10px] mb-3" style={{ color: 'var(--text-tertiary)' }}>Connected to Supabase</p>
            <div className="space-y-2">
              <Button
                variant="glass"
                size="sm"
                className="w-full gap-2 text-xs font-semibold"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={14} strokeWidth={2} />
                Sync
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs font-semibold"
                onClick={onLogout}
              >
                <LogOut size={14} />
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Database size={20} strokeWidth={2} style={{ color: 'var(--accent-primary)' }} />
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [showMobileMenuButton, setShowMobileMenuButton] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, onConfirm: null, title: '', message: '', type: 'warning' });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // History modal state
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistoryEquipment, setSelectedHistoryEquipment] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filters state
  const [filters, setFilters] = useState({
    condition: '',
    status: '',
    category: '',
    subCategory: '',
    location: '',
    dateRange: ''
  });

  // Analytics filters state (separate from inventory filters)
  const [analyticsFilters, setAnalyticsFilters] = useState({
    status: '',
    condition: '',
    equipmentType: '',
    dateRange: 'all' // all, 30days, 90days, 1year
  });

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);

  // Read notifications state
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem('readNotifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Highlighted asset ID state
  const [highlightedAssetId, setHighlightedAssetId] = useState(null);

  // General Settings state
  const [generalSettings, setGeneralSettings] = useState(() => {
    const saved = localStorage.getItem('generalSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {
          autoRefresh: true,
          compactView: false,
          desktopNotifications: true
        };
      }
    }
    return {
      autoRefresh: true,
      compactView: false,
      desktopNotifications: true
    };
  });

  // Save generalSettings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('generalSettings', JSON.stringify(generalSettings));
  }, [generalSettings]);

  // Auto-logout state
  const [logoutWarning, setLogoutWarning] = useState(false);
  const logoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes
  const WARNING_TIME = 1 * 60 * 1000; // 1 minute warning

  // Preload logo image immediately to prevent delay
  useEffect(() => {
    // Create preload link
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = '/sidebar.logo.png';
    document.head.appendChild(link);

    // Also preload via Image object
    const img = new Image();
    img.src = '/sidebar.logo.png';

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Refs for synchronized scrolling
  const headerScrollRef = useRef(null);
  const bodyScrollRef = useRef(null);

  // Excel-like cell selection
  const [selectedCell, setSelectedCell] = useState(null);

  // Add Excel-like styling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .excel-grid {
        border-collapse: separate;
        border-spacing: 0;
      }
      .excel-grid th,
      .excel-grid td {
        border-right: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
        white-space: nowrap;
        overflow: visible;
        text-overflow: unset;
        max-width: none;
      }
      .excel-grid th {
        background: var(--bg-secondary);
        font-weight: 600;
        text-align: left;
        padding: 8px 12px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary);
        border-top: 1px solid var(--border-color);
      }
      .excel-grid td {
        padding: 6px 12px;
        font-size: 13px;
        transition: background-color 0.1s;
      }
      .excel-grid tr:hover td {
        background-color: var(--accent-primary)/5;
      }
      .excel-grid .cell-selected {
        outline: 2px solid var(--accent-primary);
        outline-offset: -2px;
        background-color: var(--accent-primary)/10 !important;
      }
      .excel-grid .cell-selected:focus {
        outline: 2px solid var(--accent-primary);
      }
      .excel-row:nth-child(even) {
        background-color: var(--bg-primary);
      }
      .excel-row:nth-child(odd) {
        background-color: var(--bg-secondary);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setAuthUser(data.session?.user ?? null);
      } catch (err) {
        console.error('Auth session check failed:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
    });

    return () => authListener?.subscription?.unsubscribe();
  }, []);

  // Auto-logout functionality
  useEffect(() => {
    if (!authUser) return;

    const resetTimers = () => {
      // Clear existing timers
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      
      setLogoutWarning(false);

      // Set warning timer (14 minutes)
      warningTimerRef.current = setTimeout(() => {
        setLogoutWarning(true);
      }, INACTIVITY_LIMIT - WARNING_TIME);

      // Set logout timer (15 minutes)
      logoutTimerRef.current = setTimeout(async () => {
        await handleLogout();
        setToast({ message: 'You have been logged out due to inactivity', type: 'info' });
      }, INACTIVITY_LIMIT);
    };

    // Activity events to track
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, resetTimers);
    });

    // Start initial timers
    resetTimers();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetTimers);
      });
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [authUser]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    console.log('Attempting login with email:', loginEmail);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      console.log('Login response:', { data, error });

      if (error) {
        console.error('Login error:', error);
        setAuthError(error.message);
        setAuthLoading(false);
        return;
      }

      setAuthUser(data.user ?? null);
      setAuthLoading(false);
      console.log('Login successful');
    } catch (err) {
      console.error('Login failed with exception:', err);
      setAuthError('Login failed: ' + err.message);
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setActivePage('dashboard');
  };

  const { stats, loading: statsLoading, refresh: refreshStats } = useEquipmentStats();
  const { deletedAssets, loading: deletedLoading, refresh: refreshDeletedAssets } = useDeletedAssets();
  const {
    equipment: allEquipment,
    loading: equipLoading,
    error: equipError,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    refresh,
    totalCount,
    totalPages,
    itemsPerPage
  } = useEquipment(currentPage, filters, debouncedSearchQuery, false);

  const handleAssetSaved = () => {
    // Refresh all data after asset is saved/updated
    refresh();
    refreshStats();
  };

  const { theme, setTheme, themes, effectiveTheme } = useTheme();

  // Auto-hide mobile menu button - hide immediately when not active
  useEffect(() => {
    // Always show the edge indicator, hide only when sidebar is open
    setShowMobileMenuButton(!isMobileSidebarOpen);
  }, [isMobileSidebarOpen]);

  // Client-side filtering (only for additional filtering not handled by server)
  const equipment = useMemo(() => {
    return allEquipment.filter(item => {
      // Map old office equipment types to 'office' category
      const officeTypes = ['laptop', 'computer', 'desktop', 'monitor', 'printer', 'scanner', 'office'];
      const itemCategory = (item.equipment_type || item.category || item.type || '').toLowerCase();
      const matchesCategory = !filters.category ||
        itemCategory === filters.category.toLowerCase() ||
        (filters.category === 'office' && officeTypes.includes(itemCategory));

      if (filters.category === 'office') {
        console.log('Office filter check:', {
          itemCategory,
          equipment_type: item.equipment_type,
          category: item.category,
          type: item.type,
          matchesCategory,
          officeTypes
        });
      }

      const matchesSubCategory = !filters.subCategory ||
        (filters.category === 'logistics' && item.logistics_type === filters.subCategory) ||
        (filters.category === 'office' && item.office_type === filters.subCategory);
      const matchesStatus = !filters.status || item.status === filters.status;
      const matchesCondition = !filters.condition || item.condition === filters.condition;
      const matchesLocation = !filters.location || item.location === filters.location;
      
      // Date range filtering
      let matchesDateRange = true;
      if (filters.dateRange) {
        const itemDate = new Date(item.created_at || item.purchase_date);
        const now = new Date();
        const daysDiff = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case '7days':
            matchesDateRange = daysDiff <= 7;
            break;
          case '30days':
            matchesDateRange = daysDiff <= 30;
            break;
          case '90days':
            matchesDateRange = daysDiff <= 90;
            break;
          case '1year':
            matchesDateRange = daysDiff <= 365;
            break;
        }
      }
      
      // Improved search to work for Asset ID, Name, Serial No., Plate No.
      const matchesSearch = !searchQuery ||
        (item.asset_tag && item.asset_tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.model && item.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.serial && item.serial.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.plate_number && item.plate_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.assigned_to && item.assigned_to.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSubCategory && matchesStatus && matchesCondition && matchesLocation && matchesDateRange && matchesSearch;
    });
  }, [allEquipment, filters, searchQuery]);

  // Dashboard key numbers - use stats from useEquipmentStats which fetches all data (independent from pagination)
  const dashboardStats = useMemo(() => {
    const total = stats.total;
    const available = stats.available || 0;
    const inUse = stats.in_use || 0;
    const maintenance = stats.maintenance || 0;
    const retired = stats.retired || 0;

    return { total, available, inUse, maintenance, retired };
  }, [stats]);

  // Chart data calculations
  const categoryData = useMemo(() => {
    const categories = {};
    allEquipment.forEach(item => {
      const category = item.type || item.equipment_type || item.category || 'Other';
      categories[category] = (categories[category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [allEquipment]);

  const locationData = useMemo(() => {
    const locations = {};
    allEquipment.forEach(item => {
      const location = item.location || 'Unknown';
      locations[location] = (locations[location] || 0) + 1;
    });
    return Object.entries(locations).map(([name, value]) => ({ name, value }));
  }, [allEquipment]);

  const totalLocations = useMemo(() => {
    const uniqueLocations = new Set();
    allEquipment.forEach(item => {
      if (item.location) {
        uniqueLocations.add(item.location);
      }
    });
    return uniqueLocations.size;
  }, [allEquipment]);

  const statusData = useMemo(() => {
    const statuses = {};
    allEquipment.forEach(item => {
      const status = item.status || 'Unknown';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [allEquipment]);

  // Notification calculations
  const alerts = useMemo(() => {
    const warrantyExpiry = [];
    const maintenanceDue = [];
    const recentlyAdded = [];
    const recentlyUpdated = [];
    const recentlyDeleted = [];
    const now = new Date();

    allEquipment.forEach(item => {
      // Warranty expiry notifications (notify 90 days ahead)
      if (item.warranty_date) {
        const warrantyDate = new Date(item.warranty_date);
        const daysUntilExpiry = Math.ceil((warrantyDate - now) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 90 && daysUntilExpiry > 0) {
          const notificationId = `warranty-${item.id}`; // Static ID without day count
          warrantyExpiry.push({
            id: notificationId,
            item,
            daysLeft: daysUntilExpiry,
            severity: daysUntilExpiry <= 30 ? 'critical' : 'warning',
            read: readNotifications.includes(notificationId),
            timestamp: item.warranty_date
          });
        }
      }

      // Maintenance due notifications (assets in maintenance status for more than 30 days)
      if (item.status === 'maintenance' && item.updated_at) {
        const lastUpdated = new Date(item.updated_at);
        const daysInMaintenance = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));

        if (daysInMaintenance > 30) {
          const notificationId = `maintenance-${item.id}`; // Static ID without day count
          maintenanceDue.push({
            id: notificationId,
            item,
            daysInMaintenance,
            severity: daysInMaintenance > 60 ? 'critical' : 'warning',
            read: readNotifications.includes(notificationId),
            timestamp: item.updated_at
          });
        }
      }

      // Recently added notifications (items added in the last 7 days)
      if (item.created_at) {
        const createdAt = new Date(item.created_at);
        const daysSinceAdded = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

        if (daysSinceAdded <= 7) {
          const notificationId = `recent-${item.id}`; // Static ID without day count
          recentlyAdded.push({
            id: notificationId,
            item,
            daysSinceAdded,
            severity: 'info',
            read: readNotifications.includes(notificationId),
            timestamp: item.created_at
          });
        }
      }

      // Recently updated notifications (items updated in the last 7 days, excluding newly added)
      if (item.updated_at) {
        const updatedAt = new Date(item.updated_at);
        const daysSinceUpdate = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));

        // Only show if updated within 7 days
        if (daysSinceUpdate <= 7) {
          // If created_at exists, exclude items that were added in the last 7 days
          if (item.created_at) {
            const createdAtDate = new Date(item.created_at);
            const daysSinceAdded = Math.floor((now - createdAtDate) / (1000 * 60 * 60 * 24));
            if (daysSinceAdded <= 7) {
              // Skip - this is a newly added item
              return;
            }
          }

          const notificationId = `updated-${item.id}`; // Static ID without day count
          recentlyUpdated.push({
            id: notificationId,
            item,
            daysSinceUpdate,
            severity: 'info',
            read: readNotifications.includes(notificationId),
            timestamp: item.updated_at
          });
        }
      }
    });

    // Recently deleted notifications (assets deleted in the last 7 days)
    deletedAssets.forEach(deletedItem => {
      if (deletedItem.deleted_at) {
        const deletedAt = new Date(deletedItem.deleted_at);
        const daysSinceDeleted = Math.floor((now - deletedAt) / (1000 * 60 * 60 * 24));

        if (daysSinceDeleted <= 7) {
          const notificationId = `deleted-${deletedItem.id}`; // Static ID without day count
          recentlyDeleted.push({
            id: notificationId,
            item: {
              ...deletedItem,
              id: deletedItem.original_equipment_id
            },
            daysSinceDeleted,
            severity: 'warning',
            read: readNotifications.includes(notificationId),
            timestamp: deletedItem.deleted_at
          });
        }
      }
    });

    const allNotifications = [...warrantyExpiry, ...maintenanceDue, ...recentlyAdded, ...recentlyUpdated, ...recentlyDeleted];
    const unreadCount = allNotifications.filter(n => !n.read).length;

    // Sort within each section by their specific criteria (newest first, unread first, then by ID for consistency)
    const warrantyData = [...warrantyExpiry].sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1; // Unread first
      const timestampDiff = new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
      if (timestampDiff !== 0) return timestampDiff; // Then newest first
      return (b.item.id || 0) - (a.item.id || 0); // Then by ID for consistency
    });
    const maintenanceData = [...maintenanceDue].sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1; // Unread first
      const timestampDiff = new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
      if (timestampDiff !== 0) return timestampDiff; // Then newest first
      return (b.item.id || 0) - (a.item.id || 0); // Then by ID for consistency
    });
    const recentData = [...recentlyAdded].sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1; // Unread first
      const timestampDiff = new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
      if (timestampDiff !== 0) return timestampDiff; // Then newest first
      return (b.item.id || 0) - (a.item.id || 0); // Then by ID for consistency
    });
    const updatedData = [...recentlyUpdated].sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1; // Unread first
      const timestampDiff = new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
      if (timestampDiff !== 0) return timestampDiff; // Then newest first
      return (b.item.id || 0) - (a.item.id || 0); // Then by ID for consistency
    });
    const deletedData = [...recentlyDeleted].sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1; // Unread first
      const timestampDiff = new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
      if (timestampDiff !== 0) return timestampDiff; // Then newest first
      return (b.item.id || 0) - (a.item.id || 0); // Then by ID for consistency
    });

    // Debug logging
    console.log('Recent data sorted:', recentData.map(r => ({ id: r.item.id, tag: r.item.asset_tag, timestamp: r.timestamp, daysSinceAdded: r.daysSinceAdded, read: r.read })));

    // Get the most recent timestamp for each category
    const getMostRecentTimestamp = (arr) => {
      if (arr.length === 0) return new Date(0);
      return arr.reduce((latest, current) => {
        const latestDate = new Date(latest.timestamp || 0);
        const currentDate = new Date(current.timestamp || 0);
        return currentDate > latestDate ? current : latest;
      }).timestamp || new Date(0);
    };

    const warrantyLatest = getMostRecentTimestamp(warrantyData);
    const maintenanceLatest = getMostRecentTimestamp(maintenanceData);
    const recentLatest = getMostRecentTimestamp(recentData);
    const updatedLatest = getMostRecentTimestamp(updatedData);
    const deletedLatest = getMostRecentTimestamp(deletedData);

    // Create section objects with their data
    const sections = [];
    if (warrantyData.length > 0) {
      sections.push({
        type: 'warranty',
        data: warrantyData,
        latest: warrantyLatest
      });
    }
    if (maintenanceData.length > 0) {
      sections.push({
        type: 'maintenance',
        data: maintenanceData,
        latest: maintenanceLatest
      });
    }
    if (recentData.length > 0) {
      sections.push({
        type: 'recent',
        data: recentData,
        latest: recentLatest
      });
    }
    if (updatedData.length > 0) {
      sections.push({
        type: 'updated',
        data: updatedData,
        latest: updatedLatest
      });
    }
    if (deletedData.length > 0) {
      sections.push({
        type: 'deleted',
        data: deletedData,
        latest: deletedLatest
      });
    }

    // Sort sections by most recent notification (unread first, then by timestamp)
    sections.sort((a, b) => {
      const aUnread = a.data.some(n => !n.read);
      const bUnread = b.data.some(n => !n.read);
      
      if (aUnread && !bUnread) return -1;
      if (!aUnread && bUnread) return 1;
      
      const aDate = new Date(a.latest || 0);
      const bDate = new Date(b.latest || 0);
      return bDate - aDate;
    });

    return {
      sections,
      warrantyExpiry: warrantyData,
      maintenanceDue: maintenanceData,
      recentlyAdded: recentData,
      recentlyUpdated: updatedData,
      recentlyDeleted: deletedData,
      total: allNotifications.length,
      unreadCount
    };
  }, [allEquipment, readNotifications, deletedAssets]);

  // Debounce search query to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filters]);

  // Manage loading state based on data fetching
  useEffect(() => {
    const anyLoading = statsLoading || equipLoading;
    
    if (anyLoading) {
      setIsLoading(true);
    } else {
      // Add a minimum loading time for better UX
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [statsLoading, equipLoading]);

  // Save read notifications to localStorage
  useEffect(() => {
    localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
  }, [readNotifications]);

  // Clear highlight when leaving inventory page
  useEffect(() => {
    if (activePage !== 'inventory') {
      setHighlightedAssetId(null);
    }
  }, [activePage]);

  // Scroll to highlighted asset
  useEffect(() => {
    if (highlightedAssetId && activePage === 'inventory') {
      setTimeout(() => {
        const highlightedRow = document.querySelector('.highlighted-row');
        if (highlightedRow) {
          highlightedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [highlightedAssetId, activePage]);

  // Manage page-specific loading state
  useEffect(() => {
    if (activePage === 'inventory' && equipLoading) {
      setPageLoading(true);
    } else if (activePage === 'dashboard' && statsLoading) {
      setPageLoading(true);
    } else {
      const timer = setTimeout(() => {
        setPageLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activePage, equipLoading, statsLoading]);

  const handleAddEquipment = () => {
    setEditingEquipment(null);
    setIsModalOpen(true);
  };

  const handleEditEquipment = (item) => {
    console.log('Edit button clicked for item:', item);
    setEditingEquipment(item);
    setIsModalOpen(true);
  };

  const handleSaveEquipment = async (formData) => {
    try {
      // Validate required fields based on category
      const category = formData.category || formData.equipment_type;
      let requiredFields = ['asset_tag'];

      // Brand and Model are not required for logistics and office
      if (category !== 'logistics' && category !== 'office') {
        requiredFields.push('brand', 'model');
      }

      // Serial is not required for transport, logistics, and office
      if (category !== 'transport' && category !== 'logistics' && category !== 'office') {
        requiredFields.push('serial');
      }

      const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');

      if (missingFields.length > 0) {
        alert(`Please fill in required fields: ${missingFields.map(f => f.replace('_', ' ').toUpperCase()).join(', ')}`);
        return;
      }

      // Save directly - duplicate checking is now done in real-time in AddAssetModal
      if (editingEquipment) {
        await updateEquipment(editingEquipment.id, formData, 'system');
        setToast({ message: 'Equipment updated successfully', type: 'success' });
      } else {
        await addEquipment(formData, 'system');
        setToast({ message: 'Equipment added successfully', type: 'success' });
      }
      setIsModalOpen(false);
      setEditingEquipment(null);
    } catch (err) {
      setToast({ message: 'Error saving equipment: ' + err.message, type: 'error' });
    }
  };

  const handleViewHistory = (item) => {
    setSelectedHistoryEquipment(item);
    setHistoryModalOpen(true);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const searchInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync table horizontal scroll between header and body
  useEffect(() => {
    const headerWrapper = document.getElementById('table-header-wrapper');
    const bodyContainer = document.getElementById('table-body-container');
    
    if (!headerWrapper || !bodyContainer) return;
    
    let isSyncing = false;
    
    const syncScroll = (source, target) => {
      if (isSyncing) return;
      isSyncing = true;
      target.scrollLeft = source.scrollLeft;
      setTimeout(() => { isSyncing = false; }, 10);
    };
    
    const handleHeaderScroll = () => syncScroll(headerWrapper, bodyContainer);
    const handleBodyScroll = () => syncScroll(bodyContainer, headerWrapper);
    
    headerWrapper.addEventListener('scroll', handleHeaderScroll, { passive: true });
    bodyContainer.addEventListener('scroll', handleBodyScroll, { passive: true });
    
    // Initial sync
    headerWrapper.scrollLeft = bodyContainer.scrollLeft;
    
    return () => {
      headerWrapper.removeEventListener('scroll', handleHeaderScroll);
      bodyContainer.removeEventListener('scroll', handleBodyScroll);
    };
  }, [activePage, equipLoading]); // Re-run when inventory page loads or data changes

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && isFilterOpen) {
        setIsFilterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFilterOpen]);

  // Export All Data (JSON)
  const exportAllData = () => {
    const data = { equipment, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export Excel with proper column widths
  const exportCSV = () => {
    const headers = ['Model', 'Brand', 'Asset Tag', 'Serial', 'Type', 'Location', 'Assigned To', 'Condition', 'Status', 'Purchase Date', 'Warranty Expiry', 'Last Service'];
    const rows = equipment.map(item => [
      item.model,
      item.brand,
      item.asset_tag,
      item.serial,
      item.equipment_type,
      item.location,
      item.assigned_to,
      item.condition,
      item.status,
      item.purchase_date || '',
      item.warranty_date || '',
      item.last_service
    ]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set column widths to prevent ###
    ws['!cols'] = [
      { wch: 25 }, // Model
      { wch: 15 }, // Brand
      { wch: 15 }, // Asset Tag
      { wch: 20 }, // Serial
      { wch: 12 }, // Type
      { wch: 20 }, // Location
      { wch: 20 }, // Assigned To
      { wch: 12 }, // Condition
      { wch: 12 }, // Status
      { wch: 15 }, // Purchase Date
      { wch: 18 }, // Warranty Expiry
      { wch: 15 }  // Last Service
    ];

    // Create workbook and save
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, `inventory-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Download Excel Template for bulk import
  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    
    // Create instructions sheet
    const instructionsSheet = workbook.addWorksheet('Instructions');
    const instructions = [
      ['INSTRUCTIONS FOR BULK IMPORT'],
      [''],
      ['1. Do NOT change column headers'],
      ['2. Fill in the data in the "Template" sheet'],
      ['3. Required fields: Model, Brand, Asset Tag, Serial'],
      ['4. Optional fields: Type, Location, Assigned To, Condition, Status, Purchase Date, Warranty Expiry, Last Service'],
      [''],
      ['VALID VALUES:'],
      [''],
      ['Condition:'],
      ['  - new'],
      ['  - good'],
      ['  - fair'],
      ['  - poor'],
      [''],
      ['Status:'],
      ['  - available'],
      ['  - active'],
      ['  - maintenance'],
      ['  - retired'],
      [''],
      ['Type:'],
      ['  - Laptop'],
      ['  - Desktop'],
      ['  - Monitor'],
      ['  - Printer'],
      ['  - Other'],
      [''],
      ['Date Format:'],
      ['  - Purchase Date: YYYY-MM-DD (e.g., 2024-01-15)'],
      ['  - Warranty Expiry: YYYY-MM-DD (e.g., 2025-12-31)'],
      ['  - Last Service: YYYY-MM-DD (e.g., 2024-01-15)'],
      ['  - Leave blank if not applicable'],
      [''],
      ['IMPORTANT:'],
      ['  - Purchase Date is required for accurate age calculation in analytics'],
      ['  - Warranty Expiry helps track warranty expiration'],
      [''],
      ['5. Delete the example data before importing your own data'],
      ['6. Save the file and use the Import button']
    ];
    
    instructions.forEach(row => {
      instructionsSheet.addRow(row);
    });
    instructionsSheet.getColumn(1).width = 60;

    // Create template sheet
    const templateSheet = workbook.addWorksheet('Template');
    const headers = ['Model', 'Brand', 'Asset Tag', 'Serial', 'Type', 'Location', 'Assigned To', 'Condition', 'Status', 'Purchase Date', 'Warranty Expiry', 'Last Service'];
    templateSheet.addRow(headers);

    // Style header row
    const headerRow = templateSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    // Add example data
    const exampleData = [
      ['ThinkPad E470', 'Lenovo', 'LPT-001', 'SN123456789', 'Laptop', 'IT Department', 'Juan Dela Cruz', 'good', 'available', '2024-01-15', '2025-12-31', '2024-01-15'],
      ['Dell Latitude 5420', 'Dell', 'DLL-002', 'SN987654321', 'Laptop', 'HR Department', 'Maria Santos', 'good', 'active', '2024-02-20', '2026-06-30', '2024-02-20'],
      ['HP ProBook 450', 'HP', 'HPB-003', 'SN456789123', 'Laptop', 'Finance', '', 'fair', 'available', '2023-11-10', '2024-11-30', '2023-11-10']
    ];
    exampleData.forEach(row => templateSheet.addRow(row));

    // Set column widths
    templateSheet.columns = [
      { width: 25 }, // Model
      { width: 15 }, // Brand
      { width: 15 }, // Asset Tag
      { width: 20 }, // Serial
      { width: 12 }, // Type
      { width: 20 }, // Location
      { width: 20 }, // Assigned To
      { width: 12 }, // Condition
      { width: 12 }, // Status
      { width: 15 }, // Purchase Date
      { width: 18 }, // Warranty Expiry
      { width: 15 }  // Last Service
    ];

    // Add data validation dropdowns for sensitive fields
    // Type dropdown (column E)
    const typeList = ['Laptop', 'Desktop', 'Monitor', 'Printer', 'Other'];
    for (let row = 2; row <= 1000; row++) {
      templateSheet.getCell(`E${row}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${typeList.join(',')}"`],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid type from the dropdown'
      };
    }

    // Condition dropdown (column H)
    const conditionList = ['new', 'good', 'fair', 'poor'];
    for (let row = 2; row <= 1000; row++) {
      templateSheet.getCell(`H${row}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${conditionList.join(',')}"`],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid condition from the dropdown'
      };
    }

    // Status dropdown (column I)
    const statusList = ['available', 'active', 'maintenance', 'retired'];
    for (let row = 2; row <= 1000; row++) {
      templateSheet.getCell(`I${row}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${statusList.join(',')}"`],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid status from the dropdown'
      };
    }

    // Generate and download the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-template-${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Import CSV/Excel
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const imported = jsonData.map(row => {
          return {
            model: row.Model || row.model || '',
            brand: row.Brand || row.brand || '',
            asset_tag: row['Asset Tag'] || row.asset_tag || '',
            serial: row.Serial || row.serial || '',
            equipment_type: row.Type || row.type || row.equipment_type || 'computer',
            location: row.Location || row.location || '',
            assigned_to: row['Assigned To'] || row.assigned_to || '',
            condition: row.Condition || row.condition || 'good',
            status: row.Status || row.status || 'available',
            purchase_date: row['Purchase Date'] || row.purchase_date || '',
            warranty_date: row['Warranty Expiry'] || row['Warranty Date'] || row.warranty_date || row.warranty || '',
            last_service: row['Last Service'] || row.last_service || new Date().toISOString().split('T')[0]
          };
        });

        console.log('Imported:', imported);

        // Confirm before bulk import
        const confirmed = window.confirm(
          `You are about to import ${imported.length} items.\n\n` +
          `This will add all items to the database.\n\n` +
          `Do you want to continue?`
        );

        if (!confirmed) {
          e.target.value = '';
          return;
        }

        // Bulk import to Supabase
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const item of imported) {
          try {
            await addEquipment(item, 'system');
            successCount++;
          } catch (err) {
            errorCount++;
            errors.push(`${item.model || item.asset_tag}: ${err.message}`);
          }
        }

        // Show results
        let message = `Import completed!\n\n`;
        message += `Successfully added: ${successCount} items\n`;
        if (errorCount > 0) {
          message += `Failed: ${errorCount} items\n`;
          message += `\nErrors:\n${errors.slice(0, 5).join('\n')}`;
          if (errors.length > 5) {
            message += `\n... and ${errors.length - 5} more errors`;
          }
        }

        alert(message);

        // Refresh data after import
        await refresh();

        e.target.value = '';
      } catch (err) {
        alert('Error importing file: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Sync Data
  const handleSync = async () => {
    await refresh();
    alert('Data synchronized successfully!');
  };

  // Clear Cache
  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear all local cache? This will not delete any data from the database.')) {
      localStorage.clear();
      sessionStorage.clear();
      alert('Cache cleared successfully!');
      window.location.reload();
    }
  };

  // Show loading screen while auth state is being resolved
  if (authLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4 py-8">
        <div className="w-full max-w-md rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 shadow-[0_35px_60px_rgba(0,0,0,0.12)]">
          <div className="mb-6 text-center">
            <img src="/sidebar.logo.png" alt="Logo" className="mx-auto mb-4 h-16 w-16 object-contain" />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Sign in</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Access the equipment inventory dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Email</label>
              <Input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-[14px] border-[1px] border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Password</label>
              <Input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-[14px] border-[1px] border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                required
              />
            </div>

            {authError && (
              <p className="text-sm text-[var(--accent-red)]">{authError}</p>
            )}

            <Button type="submit" className="w-full py-3 text-sm font-semibold" disabled={authLoading}>
              {authLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--text-tertiary)]">
            Use your Supabase credentials to log in.
          </p>
        </div>
      </div>
    );
  }

  // Show page-specific loading screen
  if (pageLoading) {
    const loadingMessage = activePage === 'inventory' 
      ? 'Loading Equipment Inventory...' 
      : 'Loading Dashboard Analytics...';
    return <LoadingScreen message={loadingMessage} />;
  }

  // Show error screen if there's an equipment error
  if (equipError && activePage === 'inventory') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ 
          maxWidth: '500px', 
          textAlign: 'center',
          padding: '40px',
          borderRadius: '16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--bg-glass-light)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: '1px solid var(--border-glass)'
          }}>
            <span style={{ fontSize: '32px', color: 'var(--text-secondary)' }}>⚠️</span>
          </div>
          <h2 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '12px' 
          }}>
            Connection Error
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '14px', 
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            {equipError}
          </p>
          <button 
            onClick={refresh}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${effectiveTheme}`} style={{ background: 'var(--bg-primary)' }}>
      {/* Mobile Menu Toggle - Edge Indicator */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className={`lg:hidden fixed top-1/2 left-0 -translate-y-1/2 z-30 w-8 h-16 rounded-r-xl bg-[var(--bg-secondary)] border border-[var(--border-glass)] border-l-0 shadow-xl backdrop-blur-sm transition-all duration-300 hover:w-12 hover:shadow-2xl ${showMobileMenuButton ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`}
        style={{
          color: 'var(--text-primary)',
          background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))'
        }}
      >
        <div className="flex items-center justify-center h-full">
          {isMobileSidebarOpen ? (
            <ChevronLeft size={20} strokeWidth={2.5} />
          ) : (
            <ChevronRight size={20} strokeWidth={2.5} />
          )}
        </div>
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen z-[70] transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          inventoryCount={totalCount}
          effectiveTheme={effectiveTheme}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogout={handleLogout}
          isMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          alerts={alerts}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        />
      )}

      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`} style={{ zIndex: isMobileSidebarOpen ? 30 : 'auto', backdropFilter: isMobileSidebarOpen ? 'blur(12px)' : 'none', WebkitBackdropFilter: isMobileSidebarOpen ? 'blur(12px)' : 'none' }}>

        {/* Page Content */}
        <div
          className="flex-1 p-4 lg:p-6 overflow-y-auto gradient-mesh"
          style={{ background: 'var(--bg-primary)', paddingBottom: '65px', paddingTop: isMobileSidebarOpen ? '0' : '60px' }}
        >
          {activePage === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-6 page-transition">
              <AnalyticsDashboard equipment={allEquipment} />
            </div>
          )}

          {activePage === 'notifications' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-slide-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h3
                    className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2"
                    style={{ color: 'var(--accent-orange)' }}
                  >Notifications</h3>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>System Alerts</h2>
                  <p className="text-sm font-medium mt-2" style={{ color: 'var(--text-secondary)' }}>
                    Stay informed about warranty expirations, maintenance, and new equipment.
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    💡 Double-click on any notification to view the asset details
                  </p>
                </div>
                {alerts.unreadCount > 0 && (
                  <button
                    onClick={() => {
                      const allNotificationIds = [
                        ...alerts.warrantyExpiry.map(n => n.id),
                        ...alerts.maintenanceDue.map(n => n.id),
                        ...alerts.recentlyAdded.map(n => n.id),
                        ...alerts.recentlyUpdated.map(n => n.id),
                        ...alerts.recentlyDeleted.map(n => n.id)
                      ];
                      setReadNotifications(prev => {
                        const newRead = [...new Set([...prev, ...allNotificationIds])];
                        return newRead;
                      });
                    }}
                    className="px-4 py-2.5 md:px-6 md:py-3 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 hover:scale-105 w-full md:w-auto"
                    style={{ background: 'var(--accent-primary)', color: 'white' }}
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              {alerts.total === 0 ? (
                <div
                  className="rounded-2xl p-16 text-center"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-glass-light)' }}>
                    <Bell size={40} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                  <p className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No notifications</p>
                  <p className="text-base" style={{ color: 'var(--text-secondary)' }}>You're all caught up! Check back later for new alerts.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {alerts.sections.map((section) => {
                    if (section.type === 'warranty') {
                      return (
                        <div
                          key="warranty"
                          className="rounded-2xl p-6"
                          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid var(--accent-orange)' }}
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
                                <span className="text-2xl">📅</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                  Warranty Expiring
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Equipment warranty expiring within 90 days</p>
                              </div>
                            </div>
                            <span className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(251, 191, 36, 0.15)', color: 'var(--accent-orange)' }}>
                              {section.data.length}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {section.data.map((alert, idx) => (
                              <div
                                key={idx}
                                className="p-3 md:p-4 flex items-start gap-3 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors duration-150 relative"
                                style={{
                                  background: alert.read ? 'transparent' : 'var(--bg-secondary)',
                                  borderRadius: '8px'
                                }}
                                onClick={() => {
                                  setReadNotifications(prev => {
                                    if (!prev.includes(alert.id)) {
                                      const newRead = [...prev, alert.id];
                                      return newRead;
                                    }
                                    return prev;
                                  });
                                  setHighlightedAssetId(alert.item.id);
                                  setActivePage('inventory');
                                }}
                              >
                                {!alert.read && (
                                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500"></div>
                                )}
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-glass-light)' }}>
                                  {alert.item.equipment_type?.toLowerCase().includes('laptop') ? <Laptop size={18} style={{ color: 'var(--accent-primary)' }} /> : <Database size={18} style={{ color: 'var(--accent-primary)' }} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                    <span style={{ fontWeight: 600 }}>
                                      {alert.item.model || (alert.item.type && (alert.item.category === 'other' || alert.item.equipment_type === 'other') ? alert.item.type : `${alert.item.equipment_type || alert.item.category || alert.item.type || '—'}${alert.item.brand ? ` - ${alert.item.brand}` : ''}`)}
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
                                      {' '}warranty expires in {alert.daysLeft} day{alert.daysLeft !== 1 ? 's' : ''}
                                    </span>
                                  </p>
                                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                    Tag: {alert.item.asset_tag || 'N/A'} • {alert.item.location || 'Unknown'}
                                  </p>
                                </div>
                                <div className="text-xs font-medium flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                                  {alert.daysLeft}d left
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    } else if (section.type === 'maintenance') {
                      return (
                        <div
                          key="maintenance"
                          className="rounded-2xl p-6"
                          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid var(--accent-yellow)' }}
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(234, 179, 8, 0.15)' }}>
                                <span className="text-2xl">🔧</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                  Maintenance Due
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Equipment in maintenance for over 30 days</p>
                              </div>
                            </div>
                            <span className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(234, 179, 8, 0.15)', color: 'var(--accent-yellow)' }}>
                              {section.data.length}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {section.data.map((alert, idx) => (
                              <div
                                key={idx}
                                className="p-3 md:p-4 flex items-start gap-3 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors duration-150 relative"
                                style={{
                                  background: alert.read ? 'transparent' : 'var(--bg-secondary)',
                                  borderRadius: '8px'
                                }}
                                onClick={() => {
                                  setReadNotifications(prev => {
                                    if (!prev.includes(alert.id)) {
                                      const newRead = [...prev, alert.id];
                                      return newRead;
                                    }
                                    return prev;
                                  });
                                  setHighlightedAssetId(alert.item.id);
                                  setActivePage('inventory');
                                }}
                              >
                                {!alert.read && (
                                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500"></div>
                                )}
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-glass-light)' }}>
                                  {alert.item.equipment_type?.toLowerCase().includes('laptop') ? <Laptop size={18} style={{ color: 'var(--accent-primary)' }} /> : <Database size={18} style={{ color: 'var(--accent-primary)' }} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                    <span style={{ fontWeight: 600 }}>
                                      {alert.item.model || (alert.item.type && (alert.item.category === 'other' || alert.item.equipment_type === 'other') ? alert.item.type : `${alert.item.equipment_type || alert.item.category || alert.item.type || '—'}${alert.item.brand ? ` - ${alert.item.brand}` : ''}`)}
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
                                      {' '}in maintenance for {alert.daysInMaintenance} day{alert.daysInMaintenance !== 1 ? 's' : ''}
                                    </span>
                                  </p>
                                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                    Tag: {alert.item.asset_tag || 'N/A'} • {alert.item.location || 'Unknown'}
                                  </p>
                                </div>
                                <div className="text-xs font-medium flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                                  {alert.daysInMaintenance}d
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    } else if (section.type === 'recent') {
                      return (
                        <div
                          key="recent"
                          className="rounded-2xl p-6"
                          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid var(--accent-green)' }}
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
                                <span className="text-2xl">✨</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                  Recently Added
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Equipment added in the last 30 days</p>
                              </div>
                            </div>
                            <span className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-green)' }}>
                              {section.data.length}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {section.data.map((alert, idx) => (
                              <div
                                key={idx}
                                className="p-3 md:p-4 flex items-start gap-3 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors duration-150 relative"
                                style={{
                                  background: alert.read ? 'transparent' : 'var(--bg-secondary)',
                                  borderRadius: '8px'
                                }}
                                onClick={() => {
                                  setReadNotifications(prev => {
                                    if (!prev.includes(alert.id)) {
                                      const newRead = [...prev, alert.id];
                                      return newRead;
                                    }
                                    return prev;
                                  });
                                  setHighlightedAssetId(alert.item.id);
                                  setActivePage('inventory');
                                }}
                              >
                                {!alert.read && (
                                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500"></div>
                                )}
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-glass-light)' }}>
                                  {alert.item.equipment_type?.toLowerCase().includes('laptop') ? <Laptop size={18} style={{ color: 'var(--accent-primary)' }} /> : <Database size={18} style={{ color: 'var(--accent-primary)' }} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                    <span style={{ fontWeight: 600 }}>
                                      {alert.item.model || (alert.item.type && (alert.item.category === 'other' || alert.item.equipment_type === 'other') ? alert.item.type : `${alert.item.equipment_type || alert.item.category || alert.item.type || '—'}${alert.item.brand ? ` - ${alert.item.brand}` : ''}`)}
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
                                      {' '}was added {alert.daysSinceAdded === 0 ? 'today' : alert.daysSinceAdded === 1 ? 'yesterday' : `${alert.daysSinceAdded} days ago`}
                                    </span>
                                  </p>
                                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                    Tag: {alert.item.asset_tag || 'N/A'} • {alert.item.location || 'Unknown'}
                                  </p>
                                </div>
                                <div className="text-xs font-medium flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                                  {alert.daysSinceAdded === 0 ? 'Now' : alert.daysSinceAdded === 1 ? '1d' : `${alert.daysSinceAdded}d`}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    } else if (section.type === 'updated') {
                      return (
                        <div
                          key="updated"
                          className="rounded-2xl p-6"
                          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid var(--accent-primary)' }}
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                                <span className="text-2xl">🔄</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                  Recently Updated
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Equipment updated in the last 7 days</p>
                              </div>
                            </div>
                            <span className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)' }}>
                              {section.data.length}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {section.data.map((alert, idx) => (
                              <div
                                key={idx}
                                className="p-3 md:p-4 flex items-start gap-3 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors duration-150 relative"
                                style={{
                                  background: alert.read ? 'transparent' : 'var(--bg-secondary)',
                                  borderRadius: '8px'
                                }}
                                onClick={() => {
                                  setReadNotifications(prev => {
                                    if (!prev.includes(alert.id)) {
                                      const newRead = [...prev, alert.id];
                                      return newRead;
                                    }
                                    return prev;
                                  });
                                  setHighlightedAssetId(alert.item.id);
                                  setActivePage('inventory');
                                }}
                              >
                                {!alert.read && (
                                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500"></div>
                                )}
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-glass-light)' }}>
                                  {alert.item.equipment_type?.toLowerCase().includes('laptop') ? <Laptop size={18} style={{ color: 'var(--accent-primary)' }} /> : <Database size={18} style={{ color: 'var(--accent-primary)' }} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                    <span style={{ fontWeight: 600 }}>
                                      {alert.item.model || (alert.item.type && (alert.item.category === 'other' || alert.item.equipment_type === 'other') ? alert.item.type : `${alert.item.equipment_type || alert.item.category || alert.item.type || '—'}${alert.item.brand ? ` - ${alert.item.brand}` : ''}`)}
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
                                      {' '}was updated {alert.daysSinceUpdate === 0 ? 'today' : alert.daysSinceUpdate === 1 ? 'yesterday' : `${alert.daysSinceUpdate} days ago`}
                                    </span>
                                  </p>
                                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                    Tag: {alert.item.asset_tag || 'N/A'} • {alert.item.location || 'Unknown'}
                                  </p>
                                </div>
                                <div className="text-xs font-medium flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                                  {alert.daysSinceUpdate === 0 ? 'Now' : alert.daysSinceUpdate === 1 ? '1d' : `${alert.daysSinceUpdate}d`}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    } else if (section.type === 'deleted') {
                      return (
                        <div
                          key="deleted"
                          className="rounded-2xl p-6"
                          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid var(--accent-red)' }}
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                                <span className="text-2xl">🗑️</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                  Recently Deleted
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Equipment deleted in the last 7 days</p>
                              </div>
                            </div>
                            <span className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)' }}>
                              {section.data.length}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {section.data.map((alert, idx) => (
                              <div
                                key={idx}
                                className="p-3 md:p-4 flex items-start gap-3 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors duration-150 relative"
                                style={{
                                  background: alert.read ? 'transparent' : 'var(--bg-secondary)',
                                  borderRadius: '8px'
                                }}
                                onClick={() => {
                                  setReadNotifications(prev => {
                                    if (!prev.includes(alert.id)) {
                                      const newRead = [...prev, alert.id];
                                      return newRead;
                                    }
                                    return prev;
                                  });
                                }}
                              >
                                {!alert.read && (
                                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500"></div>
                                )}
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-glass-light)' }}>
                                  {alert.item.equipment_type?.toLowerCase().includes('laptop') ? <Laptop size={18} style={{ color: 'var(--accent-primary)' }} /> : <Database size={18} style={{ color: 'var(--accent-primary)' }} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                    <span style={{ fontWeight: 600 }}>
                                      {alert.item.model || (alert.item.type && (alert.item.category === 'other' || alert.item.equipment_type === 'other') ? alert.item.type : `${alert.item.equipment_type || alert.item.category || alert.item.type || '—'}${alert.item.brand ? ` - ${alert.item.brand}` : ''}`)}
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
                                      {' '}was deleted {alert.daysSinceDeleted === 0 ? 'today' : alert.daysSinceDeleted === 1 ? 'yesterday' : `${alert.daysSinceDeleted} days ago`}
                                    </span>
                                  </p>
                                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                    Tag: {alert.item.asset_tag || 'N/A'} • Deleted by: {alert.item.deleted_by || 'Unknown'}
                                  </p>
                                </div>
                                <div className="text-xs font-medium flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                                  {alert.daysSinceDeleted === 0 ? 'Now' : alert.daysSinceDeleted === 1 ? '1d' : `${alert.daysSinceDeleted}d`}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          )}

          {activePage === 'analytics' && (
            <div className="max-w-7xl mx-auto space-y-6 page-transition">
              {/* Analytics Header with Filters */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 
                      className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2"
                      style={{ color: 'var(--accent-primary)' }}
                    >Insights</h3>
                    <h2 className="text-3xl font-black tracking-tight">Analytics</h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    <TrendingUp size={16} />
                    <span>Real-time data analysis</span>
                  </div>
                </div>

                {/* Analytics Filters Bar */}
                <div
                  className="flex flex-wrap items-center gap-3 p-4 rounded-[16px] glass-card-modern"
                >
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Filter by:</span>
                  
                  {/* Equipment Type Filter */}
                  <select
                    value={analyticsFilters.equipmentType}
                    onChange={(e) => setAnalyticsFilters({...analyticsFilters, equipmentType: e.target.value})}
                    className="h-9 px-3 pr-8 rounded-full text-xs font-medium cursor-pointer"
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      background: analyticsFilters.equipmentType ? 'var(--accent-primary)' : 'var(--bg-glass-light)',
                      color: analyticsFilters.equipmentType ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${analyticsFilters.equipmentType ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${analyticsFilters.equipmentType ? 'white' : 'currentColor'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 10px center',
                      backgroundSize: '12px 12px'
                    }}
                  >
                    <option value="">All Types</option>
                    <option value="computer">Computer</option>
                    <option value="laptop">Laptop</option>
                    <option value="tablet">Tablet</option>
                    <option value="monitor">Monitor</option>
                    <option value="printer">Printer</option>
                    <option value="scanner">Scanner</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={analyticsFilters.status}
                    onChange={(e) => setAnalyticsFilters({...analyticsFilters, status: e.target.value})}
                    className="h-9 px-3 pr-8 rounded-full text-xs font-medium cursor-pointer"
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      background: analyticsFilters.status ? 'var(--accent-primary)' : 'var(--bg-glass-light)',
                      color: analyticsFilters.status ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${analyticsFilters.status ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${analyticsFilters.status ? 'white' : 'currentColor'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 10px center',
                      backgroundSize: '12px 12px'
                    }}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>

                  {/* Condition Filter */}
                  <select
                    value={analyticsFilters.condition}
                    onChange={(e) => setAnalyticsFilters({...analyticsFilters, condition: e.target.value})}
                    className="h-9 px-3 pr-8 rounded-full text-xs font-medium cursor-pointer"
                    style={{ 
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      background: analyticsFilters.condition ? 'var(--accent-primary)' : 'var(--bg-glass-light)',
                      color: analyticsFilters.condition ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${analyticsFilters.condition ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${analyticsFilters.condition ? 'white' : 'currentColor'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 10px center',
                      backgroundSize: '12px 12px'
                    }}
                  >
                    <option value="">All Condition</option>
                    <option value="new">New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>

                  {/* Date Range Filter */}
                  <select
                    value={analyticsFilters.dateRange}
                    onChange={(e) => setAnalyticsFilters({...analyticsFilters, dateRange: e.target.value})}
                    className="h-9 px-3 pr-8 rounded-full text-xs font-medium cursor-pointer"
                    style={{ 
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      background: analyticsFilters.dateRange !== 'all' ? 'var(--accent-primary)' : 'var(--bg-glass-light)',
                      color: analyticsFilters.dateRange !== 'all' ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${analyticsFilters.dateRange !== 'all' ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${analyticsFilters.dateRange !== 'all' ? 'white' : 'currentColor'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 10px center',
                      backgroundSize: '12px 12px'
                    }}
                  >
                    <option value="all">All Time</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                    <option value="1year">Last Year</option>
                  </select>

                  {/* Clear Filters */}
                  {(analyticsFilters.status || analyticsFilters.condition || analyticsFilters.equipmentType !== '' || analyticsFilters.dateRange !== 'all') && (
                    <button
                      onClick={() => setAnalyticsFilters({ status: '', condition: '', equipmentType: '', dateRange: 'all' })}
                      className="h-9 px-3 rounded-full text-xs font-medium flex items-center gap-1"
                      style={{ 
                        background: 'var(--bg-glass-light)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-glass)'
                      }}
                    >
                      <X size={12} />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Analytics Dashboard with Filtered Data */}
              <AnalyticsDashboard 
                equipment={equipment} 
                filters={analyticsFilters}
              />
            </div>
          )}

          {activePage === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-8 page-transition">
              <div>
                <h3
                  className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2"
                  style={{ color: 'var(--accent-primary)' }}
                >Configuration</h3>
                <h2 className="text-3xl font-black tracking-tight">System Settings</h2>
              </div>

              {/* General Settings */}
              <div className="glass-card-modern p-6">
                <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Settings size={20} style={{ color: 'var(--accent-primary)' }} />
                  General Settings
                </h4>
                <div className="space-y-4">
                  {[
                    { key: 'autoRefresh', label: 'Auto-refresh Data', desc: 'Refresh inventory every 5 minutes' },
                    { key: 'compactView', label: 'Compact View', desc: 'Reduce spacing in tables' },
                    { key: 'desktopNotifications', label: 'Desktop Notifications', desc: 'Get alerts for system events' },
                  ].map((setting) => (
                    <div 
                      key={setting.key}
                      className="flex items-center justify-between py-3"
                      style={{ borderBottom: '1px solid var(--border-glass)' }}
                    >
                      <div>
                        <p className="font-medium">{setting.label}</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{setting.desc}</p>
                      </div>
                      <div
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                          generalSettings[setting.key] ? '' : ''
                        }`}
                        style={{ background: generalSettings[setting.key] ? 'var(--accent-primary)' : 'var(--bg-glass-light)' }}
                        onClick={() => setGeneralSettings(prev => ({ ...prev, [setting.key]: !prev[setting.key] }))}
                      >
                        <div 
                          className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all"
                          style={{ 
                            right: generalSettings[setting.key] ? '2px' : 'auto',
                            left: generalSettings[setting.key] ? 'auto' : '2px'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Database Settings */}
              <div className="glass-card-modern p-6">
                <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Database size={20} style={{ color: 'var(--accent-green)' }} />
                  Database Connection
                </h4>
                <div className="space-y-4">
                  <div>
                    <label 
                      className="text-xs font-bold uppercase tracking-widest mb-2 block"
                      style={{ color: 'var(--text-tertiary)' }}
                    >Supabase URL</label>
                    <Input value="https://zrgprdgvfcojfeqkurke.supabase.co" readOnly />
                  </div>
                  <div className="flex items-center gap-2" style={{ color: 'var(--accent-green)' }}>
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ background: 'var(--accent-green)', boxShadow: '0 0 10px var(--accent-green)' }}
                    ></div>
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="glass-card-modern p-6">
                <h4 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <FileDown size={20} style={{ color: 'var(--accent-orange)' }} strokeWidth={2} />
                  Data Management
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" className="gap-2" onClick={exportAllData}>
                    <FileDown size={18} strokeWidth={2} />
                    Export All Data
                  </Button>
                  <Button variant="glass" className="gap-2" onClick={handleSync}>
                    <RefreshCw size={18} strokeWidth={2} />
                    Sync Now
                  </Button>
                  <Button variant="danger" size="sm" className="gap-2" onClick={handleClearCache}>
                    <Trash2 size={18} strokeWidth={2} />
                    Clear Cache
                  </Button>
                </div>
              </div>

              {/* System Info */}
              <div className="glass-card-modern p-6">
                <h4 
                  className="text-sm font-bold uppercase tracking-widest mb-4"
                  style={{ color: 'var(--text-tertiary)' }}
                >System Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { label: 'Version', value: 'v2.0.0' },
                    { label: 'Build', value: 'React + Vite + iOS 26' },
                    { label: 'Database', value: 'Supabase' },
                    { label: 'Last Updated', value: new Date().toLocaleDateString() },
                  ].map((info) => (
                    <div key={info.label}>
                      <span style={{ color: 'var(--text-secondary)' }}>{info.label}:</span>
                      <span className="ml-2 font-medium">{info.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePage === 'inventory' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-slide-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h3 
                    className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2"
                    style={{ color: 'var(--accent-primary)' }}
                  >Assets</h3>
                  <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Equipment Inventory</h2>
                  <p className="text-sm font-medium mt-2" style={{ color: 'var(--text-secondary)' }}>
                    Track and manage all equipment across {totalLocations} locations.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', minHeight: '80px' }}>
                      <p className="text-[10px] font-bold uppercase tracking-normal whitespace-normal break-words" style={{ color: 'var(--text-tertiary)' }}>Total Assets</p>
                      <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{dashboardStats.total}</p>
                    </div>
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', minHeight: '80px' }}>
                      <p className="text-[10px] font-bold uppercase tracking-normal whitespace-normal break-words" style={{ color: 'var(--text-tertiary)' }}>Available</p>
                      <p className="text-2xl font-black" style={{ color: 'var(--accent-cyan)' }}>{dashboardStats.available}</p>
                    </div>
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', minHeight: '80px' }}>
                      <p className="text-[10px] font-bold uppercase tracking-normal whitespace-normal break-words" style={{ color: 'var(--text-tertiary)' }}>In Use</p>
                      <p className="text-2xl font-black" style={{ color: 'var(--accent-green)' }}>{dashboardStats.inUse}</p>
                    </div>
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', minHeight: '80px' }}>
                      <p className="text-[10px] font-bold uppercase tracking-normal whitespace-normal break-words" style={{ color: 'var(--text-tertiary)' }}>Maintenance</p>
                      <p className="text-2xl font-black" style={{ color: 'var(--accent-orange)' }}>{dashboardStats.maintenance}</p>
                    </div>
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', minHeight: '80px' }}>
                      <p className="text-[10px] font-bold uppercase tracking-normal whitespace-normal break-words" style={{ color: 'var(--text-tertiary)' }}>Retired</p>
                      <p className="text-2xl font-black" style={{ color: 'var(--accent-red)' }}>{dashboardStats.retired}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                  <div className="flex-1 grid gap-3 sm:grid-cols-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImport}
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                    />
                    <Button variant="secondary" className="w-full h-12 px-3 gap-2 flex items-center justify-center text-sm" onClick={downloadTemplate}>
                      <div className="w-5 h-5 flex items-center justify-center">
                        <FileDown size={20} strokeWidth={2.5} />
                      </div>
                      <span>Download Template</span>
                    </Button>
                    <Button variant="secondary" className="w-full h-12 px-3 gap-2 flex items-center justify-center text-sm" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-5 h-5 flex items-center justify-center">
                        <FileUp size={20} strokeWidth={2.5} />
                      </div>
                      <span>Import</span>
                    </Button>
                    <Button variant="secondary" className="w-full h-12 px-3 gap-2 flex items-center justify-center text-sm" onClick={exportCSV}>
                      <div className="w-5 h-5 flex items-center justify-center">
                        <FileDown size={20} strokeWidth={2.5} />
                      </div>
                      <span>Export Excel</span>
                    </Button>
                  </div>
                  <Button variant="primary" className="w-full sm:w-auto h-12 px-6 gap-2 shadow-[0_12px_24px_rgba(99,102,241,0.25)]" onClick={handleAddEquipment}>
                    <Plus size={20} strokeWidth={2.5} />
                    Add Asset
                  </Button>
                </div>
              </div>

              {/* Inventory Table Card */}
              <div>
                <Card glass={false} className="flex flex-col">
                  {/* Sticky Search/Filter Header */}
                  <div
                    className="sticky top-0 z-20 p-6"
                    style={{
                      borderBottom: '1px solid var(--border-glass)',
                      background: 'var(--bg-glass-light)',
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-col gap-3 w-full lg:w-auto">
                        <div
                          className="relative group rounded-[12px] border border-[var(--border-glass)] bg-[var(--bg-glass-light)]"
                          style={{ transition: 'all 0.2s ease' }}
                        >
                          <div className="flex items-center h-10 px-3">
                            <Search
                              size={18}
                              strokeWidth={2}
                              style={{ color: 'var(--text-tertiary)' }}
                            />
                            <input
                              ref={searchInputRef}
                              type="text"
                              placeholder="Search assets..."
                              className="bg-transparent border-none outline-none text-sm ml-2 w-48 placeholder:text-[var(--text-tertiary)]"
                              style={{ color: 'var(--text-primary)' }}
                              value={searchQuery}
                              onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                              }}
                            />
                            {searchQuery && (
                              <button
                                onClick={() => {
                                  setSearchQuery('');
                                  searchInputRef.current?.focus();
                                }}
                                className="p-1 rounded-md hover:bg-white/10 transition-colors"
                                style={{ color: 'var(--text-tertiary)' }}
                              >
                                <X size={14} strokeWidth={2} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Category:</span>
                            <select
                              value={filters.category}
                              onChange={(e) => setFilters({ ...filters, category: e.target.value, subCategory: '' })}
                              className="h-9 px-3 pr-8 rounded-full text-xs font-medium cursor-pointer transition-all hover:opacity-80"
                              style={{
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                appearance: 'none',
                                background: filters.category ? 'var(--bg-glass-light)' : 'var(--bg-glass-light)',
                                color: filters.category ? 'var(--text-primary)' : 'var(--text-secondary)',
                                border: `1px solid ${filters.category ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${filters.category ? 'var(--accent-primary)' : 'currentColor'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                backgroundSize: '12px 12px',
                                minWidth: '140px'
                              }}
                            >
                              <option value="">Select Category</option>
                              <option value="transport">🚚 Transport</option>
                              <option value="logistics">📦 Logistics</option>
                              <option value="office">🏢 Office</option>
                              <option value="other">📋 Other</option>
                            </select>
                          </div>
                          {filters.category === 'logistics' && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Type:</span>
                              <select
                                value={filters.subCategory}
                                onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })}
                                className="h-9 px-3 pr-8 rounded-full text-xs font-medium cursor-pointer transition-all hover:opacity-80"
                                style={{
                                  WebkitAppearance: 'none',
                                  MozAppearance: 'none',
                                  appearance: 'none',
                                  background: filters.subCategory ? 'var(--bg-glass-light)' : 'var(--bg-glass-light)',
                                  color: filters.subCategory ? 'var(--text-primary)' : 'var(--text-secondary)',
                                  border: `1px solid ${filters.subCategory ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${filters.subCategory ? 'var(--accent-primary)' : 'currentColor'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'right 10px center',
                                  backgroundSize: '12px 12px',
                                  minWidth: '160px'
                                }}
                              >
                                <option value="">Select Type</option>
                                <option value="wooden_crates">🪵 Wooden Crates</option>
                                <option value="plastic_crates">🔲 Plastic Crates</option>
                                <option value="pallets">📏 Pallets</option>
                                <option value="storage_bins">🗄️ Storage Bins</option>
                                <option value="wire_cages">🔗 Wire Cages</option>
                              </select>
                            </div>
                          )}
                          {filters.category === 'office' && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Type:</span>
                              <select
                                value={filters.subCategory}
                                onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })}
                                className="h-9 px-3 pr-8 rounded-full text-xs font-medium cursor-pointer transition-all hover:opacity-80"
                                style={{
                                  WebkitAppearance: 'none',
                                  MozAppearance: 'none',
                                  appearance: 'none',
                                  background: filters.subCategory ? 'var(--bg-glass-light)' : 'var(--bg-glass-light)',
                                  color: filters.subCategory ? 'var(--text-primary)' : 'var(--text-secondary)',
                                  border: `1px solid ${filters.subCategory ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${filters.subCategory ? 'var(--accent-primary)' : 'currentColor'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'right 10px center',
                                  backgroundSize: '12px 12px',
                                  minWidth: '160px'
                                }}
                              >
                                <option value="">Select Type</option>
                                <option value="desktop_computer">🖥️ Desktop Computer</option>
                                <option value="laptop">💻 Laptop</option>
                                <option value="monitor">🖥️ Monitor</option>
                                <option value="keyboard_mouse">⌨️ Keyboard & Mouse</option>
                                <option value="printer">🖨️ Printer</option>
                                <option value="photocopier">📄 Photocopier</option>
                                <option value="scanner">🔍 Scanner</option>
                                <option value="shredder">🗑️ Shredder</option>
                                <option value="telephone">📞 Telephone</option>
                                <option value="router">📶 Router</option>
                                <option value="office_desk">🪑 Office Desk</option>
                                <option value="office_chair">💺 Office Chair</option>
                                <option value="filing_cabinet">📁 Filing Cabinet</option>
                                <option value="bookshelf">📚 Bookshelf</option>
                              </select>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Status:</span>
                            <select
                              value={filters.status}
                              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                              className="h-9 px-3 pr-8 rounded-full text-xs font-medium cursor-pointer transition-all hover:opacity-80"
                              style={{
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                appearance: 'none',
                                background: filters.status ? 'var(--bg-glass-light)' : 'var(--bg-glass-light)',
                                color: filters.status ? 'var(--text-primary)' : 'var(--text-secondary)',
                                border: `1px solid ${filters.status ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${filters.status ? 'var(--accent-primary)' : 'currentColor'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                backgroundSize: '12px 12px',
                                minWidth: '140px'
                              }}
                            >
                              <option value="">All Status</option>
                              <option value="available">✅ Available</option>
                              <option value="in_use">👤 In Use</option>
                              <option value="maintenance">⚠️ Under Maintenance</option>
                              <option value="retired">❌ Retired</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Location:</span>
                            <select
                              value={filters.location}
                              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                              className="h-9 px-3 pr-8 rounded-full text-xs font-medium cursor-pointer transition-all hover:opacity-80"
                              style={{
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                appearance: 'none',
                                background: filters.location ? 'var(--bg-glass-light)' : 'var(--bg-glass-light)',
                                color: filters.location ? 'var(--text-primary)' : 'var(--text-secondary)',
                                border: `1px solid ${filters.location ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${filters.location ? 'var(--accent-primary)' : 'currentColor'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                backgroundSize: '12px 12px',
                                minWidth: '140px'
                              }}
                            >
                              <option value="">All Locations</option>
                              {Array.from(new Set(allEquipment.map(item => item.location).filter(Boolean))).sort().map(location => (
                                <option key={location} value={location}>{location}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Date Range:</span>
                            <select
                              value={filters.dateRange}
                              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                              className="h-9 px-3 pr-8 rounded-full text-xs font-medium cursor-pointer transition-all hover:opacity-80"
                              style={{
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                appearance: 'none',
                                background: filters.dateRange ? 'var(--bg-glass-light)' : 'var(--bg-glass-light)',
                                color: filters.dateRange ? 'var(--text-primary)' : 'var(--text-secondary)',
                                border: `1px solid ${filters.dateRange ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${filters.dateRange ? 'var(--accent-primary)' : 'currentColor'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                backgroundSize: '12px 12px',
                                minWidth: '140px'
                              }}
                            >
                              <option value="">All Time</option>
                              <option value="7days">Last 7 Days</option>
                              <option value="30days">Last 30 Days</option>
                              <option value="90days">Last 90 Days</option>
                              <option value="1year">Last Year</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Condition:</span>
                            <select
                              value={filters.condition}
                              onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                              className="h-9 px-3 pr-8 rounded-full text-xs font-medium cursor-pointer transition-all hover:opacity-80"
                              style={{
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                appearance: 'none',
                                background: filters.condition ? 'var(--bg-glass-light)' : 'var(--bg-glass-light)',
                                color: filters.condition ? 'var(--text-primary)' : 'var(--text-secondary)',
                                border: `1px solid ${filters.condition ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${filters.condition ? 'var(--accent-primary)' : 'currentColor'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                backgroundSize: '12px 12px',
                                minWidth: '120px'
                              }}
                            >
                              <option value="">All Condition</option>
                              <option value="new">✨ New</option>
                              <option value="good">👍 Good</option>
                              <option value="fair">⚖️ Fair</option>
                              <option value="poor">👎 Poor</option>
                            </select>
                          </div>
                          {(filters.condition || filters.status || filters.category || filters.subCategory || filters.location || filters.dateRange) && (
                            <button
                              onClick={() => setFilters({ condition: '', status: '', category: '', subCategory: '', location: '', dateRange: '' })}
                              className="h-9 px-3 rounded-full text-xs font-medium flex items-center gap-1 transition-all hover:opacity-80"
                              style={{
                                background: 'var(--bg-glass-light)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-glass)'
                              }}
                            >
                              <X size={12} />
                              Clear Filters
                            </button>
                          )}
                          <button
                            onClick={() => refresh()}
                            className="h-9 px-3 rounded-full text-xs font-medium flex items-center gap-1 transition-all hover:opacity-80"
                            style={{
                              background: 'var(--bg-glass-light)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-glass)'
                            }}
                            title="Refresh data"
                          >
                            <RefreshCw size={12} />
                            Refresh
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p
                          className="text-[11px] font-bold uppercase tracking-widest"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          Showing {equipment.length} of {totalCount} Assets (Page {currentPage} of {totalPages})
                        </p>
                        <div className="flex items-center gap-2">
                          {totalPages > 1 && (
                            <>
                              <Button
                                variant="outline"
                                className="h-10 px-3 gap-2 border-[1.5px] border-[var(--border-glass)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                              >
                                <ChevronLeft size={16} />
                              </Button>
                              <Button
                                variant="outline"
                                className="h-10 px-3 gap-2 border-[1.5px] border-[var(--border-glass)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                              >
                                <ChevronRight size={16} />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Table with Sticky Header - Single Table */}
                <div className={`rounded-[16px] border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden ${isMobileSidebarOpen ? 'backdrop-blur-xl' : ''}`} style={{ zIndex: isMobileSidebarOpen ? 35 : 'auto', backdropFilter: isMobileSidebarOpen ? 'blur(20px)' : 'none', WebkitBackdropFilter: isMobileSidebarOpen ? 'blur(20px)' : 'none', background: isMobileSidebarOpen ? 'rgba(30, 41, 59, 0.5)' : 'var(--bg-secondary)' }}>
                  <div
                    className="overflow-auto relative custom-scrollbar"
                    style={{ maxHeight: 'calc(100vh - 185px)', scrollbarGutter: 'stable' }}
                  >
                    <table className="text-left border-collapse excel-grid" style={{ tableLayout: 'auto', width: 'auto' }}>
                      <thead className="sticky top-0" style={{ zIndex: 50, background: 'transparent', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', borderBottom: '3px solid var(--accent-primary)' }}>
                        <tr>
                          <th className="sticky left-0 top-0 font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ zIndex: 150, background: 'var(--bg-secondary)', isolation: 'isolate', borderRight: '2px solid var(--border-color)', padding: generalSettings.compactView ? '4px' : '12px', fontSize: generalSettings.compactView ? '10px' : '12px', textAlign: 'center', width: '50px', minWidth: '50px' }}>
                            #
                          </th>
                          <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Asset</th>
                          <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Asset Tag</th>
                          <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Serial</th>
                          {filters.category === 'logistics' && (
                            <>
                              <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Logistics Type</th>
                              <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Quantity</th>
                              <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Material</th>
                              <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Dimensions</th>
                              <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Load Capacity</th>
                            </>
                          )}
                          {filters.category === 'office' && (
                            <>
                              <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Office Type</th>
                              <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Specs</th>
                              <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Use</th>
                              <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Quantity</th>
                            </>
                          )}
                          {filters.category === 'transport' && (
                            <>
                              <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Plate Number</th>
                              <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Engine Number</th>
                              <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Fuel Type</th>
                              <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Capacity</th>
                              <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Year</th>
                            </>
                          )}
                          {!filters.category && (
                            <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Type</th>
                          )}
                          <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Location</th>
                          <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Assigned</th>
                          <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Cond</th>
                          <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Status</th>
                          <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Purchase Date</th>
                          <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Warranty</th>
                          <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Description</th>
                          <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Updated By</th>
                          <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Updated</th>
                          <th className="text-left font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]" style={{ color: 'var(--accent-primary)', borderRight: '1px solid var(--border-color)', letterSpacing: '0.1em', fontWeight: '800', padding: generalSettings.compactView ? '4px 4px' : '12px 12px', fontSize: generalSettings.compactView ? '10px' : '12px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {equipment.length > 0 ? (
                          equipment.map((item, index) => {
                            const isAvailable = item.status && item.status.toLowerCase() === 'available';
                            const hasAssignment = item.assigned_to && item.assigned_to.trim();
                            
                            return (
                              <tr
                                key={item.id}
                                className={`excel-row table-row-hover ${index % 2 === 0 ? 'excel-row-even' : 'excel-row-odd'} hover:bg-[var(--accent-primary)]/5 cursor-pointer ${highlightedAssetId === item.id ? 'highlighted-row' : ''}`}
                                style={(isAvailable && hasAssignment) ? { borderLeft: '3px solid var(--accent-red)' } : (highlightedAssetId === item.id ? { borderLeft: '4px solid var(--accent-green)', background: 'rgba(34, 197, 94, 0.1)' } : {})}
                                onClick={() => {
                                  setSelectedCell({ row: index, col: null });
                                  if (highlightedAssetId === item.id) {
                                    setHighlightedAssetId(null);
                                  }
                                }}
                              >
                                <td
                                  className={`sticky left-0 px-0 py-0 text-sm text-[var(--text-primary)] text-center border-r border-[var(--border-color)] ${selectedCell?.row === index && selectedCell?.col === 0 ? 'cell-selected' : ''}`}
                                  style={{ position: 'sticky', left: 0, zIndex: 10, background: 'var(--bg-secondary)', isolation: 'isolate', width: '50px', minWidth: '50px', textAlign: 'center' }}
                                  onClick={(e) => { e.stopPropagation(); setSelectedCell({ row: index, col: 0 }); }}
                                >
                                  <div style={{
                                    position: 'relative',
                                    zIndex: 11,
                                    padding: generalSettings.compactView ? '4px' : '8px 12px',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--bg-secondary)'
                                  }}>
                                    {index + 1}
                                  </div>
                                </td>
                                <td
                                  className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)] overflow-hidden"
                                  style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}
                                  onClick={(e) => { e.stopPropagation(); setSelectedCell({ row: index, col: 1 }); }}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="flex-shrink-0">
                                      {item.equipment_type?.toLowerCase().includes('laptop') ? (
                                        <Laptop size={16} />
                                      ) : (
                                        <Database size={16} />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold text-sm truncate text-[var(--text-primary)]">
                                        {item.model || (item.type && (item.category === 'other' || item.equipment_type === 'other') ? item.type : `${item.equipment_type || item.category || item.type || '—'}${item.brand ? ` - ${item.brand}` : ''}`)}
                                      </p>
                                      {item.model && (
                                        <p className="text-[10px] text-[var(--text-secondary)]">{item.brand || 'No Brand'}</p>
                                      )}
                                      {!item.model && item.brand && (item.category === 'other' || item.equipment_type === 'other') && (
                                        <p className="text-[10px] text-[var(--text-secondary)]">{item.brand}</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                  {item.asset_tag || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                </td>
                                <td
                                  className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]"
                                  style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}
                                  onClick={(e) => { e.stopPropagation(); setSelectedCell({ row: index, col: 2 }); }}
                                >
                                  {item.serial || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                </td>
                                {filters.category === 'logistics' && (
                                  <>
                                    <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                      {item.logistics_type || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                    </td>
                                    <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                      {item.quantity || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                    </td>
                                    <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                      {item.material || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                    </td>
                                    <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                      {item.dimensions || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                    </td>
                                    <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                      {item.load_capacity || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                    </td>
                                  </>
                                )}
                                {filters.category === 'office' && (
                                  <>
                                    <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                      {item.office_type || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                    </td>
                                    <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                      {item.specs || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                    </td>
                                    <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                      {item.use || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                    </td>
                                    <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                      {item.office_quantity || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                    </td>
                                  </>
                                )}
                                {filters.category === 'transport' && (
                                  <>
                                    <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                      {item.plate_number || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                    </td>
                                    <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                      {item.engine_number || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                    </td>
                                    <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                      {item.fuel_type || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                    </td>
                                    <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                      {item.capacity || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                    </td>
                                    <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                      {item.year_manufactured || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                    </td>
                                  </>
                                )}
                                {!filters.category && (
                                  <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                    {(item.category === 'other' || item.equipment_type === 'other') 
                                      ? 'other' 
                                      : (item.type || item.equipment_type || item.category || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>)
                                    }
                                  </td>
                                )}
                                <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                  {item.location || <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                </td>
                                <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                  {(() => {
                                    if (item.assigned_to && item.assigned_to.trim()) {
                                      return item.assigned_to;
                                    }
                                    if (item.status === 'available') {
                                      return <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>;
                                    }
                                    return <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Not assigned</span>;
                                  })()}
                                </td>
                            <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                  <span className={`status-badge status-${(item.condition || 'unknown').toString().toLowerCase()}`}>
                                    {item.condition || '—'}
                                  </span>
                                </td>
                            <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                  <span className={`status-badge status-${(item.status || 'unknown').toString().toLowerCase()}`}>
                                    {item.status || '—'}
                                  </span>
                                  {(() => {
                                    const isAvailable = item.status && item.status.toLowerCase() === 'available';
                                    const hasAssignment = item.assigned_to && item.assigned_to.trim();
                                    if (isAvailable && hasAssignment) {
                                      return (
                                        <span 
                                          title={`Warning: Assigned to "${item.assigned_to.trim()}" but status is "Available"`}
                                          className="status-warning-icon"
                                        >
                                          !
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </td>
                                <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                  {item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>}
                                </td>
                                <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                  {(() => {
                                    if (!item.warranty_date) {
                                      return <span style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>⚠️ Empty</span>;
                                    }
                                    const warranty = new Date(item.warranty_date);
                                    const now = new Date();
                                    const isExpired = warranty < now;
                                    const daysLeft = Math.ceil((warranty - now) / (1000 * 60 * 60 * 24));
                                    return (
                                      <span style={{
                                        padding: '2px 6px',
                                        borderRadius: '2px',
                                        fontSize: '10px',
                                        fontWeight: '400',
                                        backgroundColor: isExpired ? 'var(--bg-red)' : daysLeft < 30 ? 'var(--bg-yellow)' : 'var(--bg-green)',
                                        color: isExpired ? 'var(--text-red)' : daysLeft < 30 ? 'var(--text-yellow)' : 'var(--text-green)'
                                      }} title={isExpired ? 'Expired' : `${daysLeft} days remaining`}>
                                        {isExpired ? 'Expired' : daysLeft < 30 ? `⚠️ ${daysLeft}d` : 'Valid'}
                                      </span>
                                    );
                                  })()}
                                </td>
                                <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }} title={item.notes || ''}>
                                  {item.notes || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>—</span>}
                                </td>
                                <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                  {item.added_by || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Unknown</span>}
                                </td>
                                <td className="text-sm text-[var(--text-primary)] border-r border-[var(--border-color)]" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }}>
                                  {item.updated_at 
                                    ? new Date(item.updated_at).toLocaleDateString() + ' ' + new Date(item.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                    : (item.created_at 
                                      ? new Date(item.created_at).toLocaleDateString() + ' ' + new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                      : <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Unknown</span>)
                                  }
                                </td>
                            <td className="text-center" style={{ padding: generalSettings.compactView ? '4px' : '12px 16px' }}>
                                  <div className="flex items-center justify-center gap-1">
                                    <button 
                                      className="p-1 border border-[var(--border-color)] rounded text-[var(--text-tertiary)] hover:bg-[var(--bg-glass-light)] hover:border-[var(--border-glass)] hover:text-[var(--text-primary)] transition-colors"
                                      title="View History"
                                      onClick={() => handleViewHistory(item)}
                                    >
                                      <History size={12} />
                                    </button>
                                    <button
                                      className="p-1 border border-[var(--border-color)] rounded text-[var(--text-tertiary)] hover:bg-[var(--bg-blue)] hover:border-[var(--border-blue)] hover:text-[var(--text-blue)] transition-colors"
                                      title="Edit"
                                      onClick={(e) => {
                                        console.log('Edit button clicked', item);
                                        e.stopPropagation();
                                        handleEditEquipment(item);
                                      }}
                                    >
                                      <Edit3 size={12} />
                                    </button>
                                    <button
                                      className="p-1 border border-[var(--border-color)] rounded text-[var(--text-tertiary)] hover:bg-[var(--bg-red)] hover:border-[var(--border-red)] hover:text-[var(--text-red)] transition-colors"
                                      title="Delete"
                                      onClick={() => {
                                        setConfirmDialog({
                                          isOpen: true,
                                          title: 'Delete Equipment',
                                          message: `Are you sure you want to delete ${item.model}? This action cannot be undone.`,
                                          type: 'danger',
                                          onConfirm: async () => {
                                            try {
                                              await deleteEquipment(item.id);
                                              setToast({ message: `${item.model} deleted successfully`, type: 'success' });
                                            } catch (err) {
                                              setToast({ message: 'Error deleting equipment: ' + err.message, type: 'error' });
                                            }
                                          }
                                        });
                                      }}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </td>
                          </tr>
                        );
                      })
                      ) : (
                        <tr>
                          <td className="text-sm text-[var(--text-primary)] text-center" style={{ padding: generalSettings.compactView ? '2px 4px' : '8px 12px', fontSize: generalSettings.compactView ? '11px' : '14px' }} colSpan="15">
                            <div className="flex flex-col items-center justify-center py-12">
                              <div className="w-10 h-10 rounded-full bg-[var(--bg-gray)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-gray)] font-bold mb-4">
                                !
                              </div>
                              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">No assets found</h4>
                              <p className="text-xs text-[var(--text-tertiary)] mb-4">Try adjusting your search filters or query</p>
                              <button
                                className="px-3 py-1.5 bg-[var(--accent-primary)] text-white border border-[var(--accent-primary)] rounded text-xs font-medium transition-colors hover:bg-[var(--accent-hover)]"
                                onClick={() => setSearchQuery('')}
                              >
                                Clear Search
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              </Card>
            </div>
          </div>
          )}
          
        </div>
      </div>
      
      <EquipmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEquipment(null);
        }}
        asset={editingEquipment}
        onSaved={handleAssetSaved}
        authUser={authUser}
        onToast={setToast}
      />
      
      <EquipmentHistoryModal
        isOpen={historyModalOpen}
        onClose={() => {
          setHistoryModalOpen(false);
          setSelectedHistoryEquipment(null);
        }}
        equipmentId={selectedHistoryEquipment?.id}
        equipmentData={selectedHistoryEquipment}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />

      {/* Auto-logout warning modal */}
      {logoutWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 max-w-md mx-4 border border-[var(--border-glass)] shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-orange)]/20 flex items-center justify-center">
                <Clock size={20} style={{ color: 'var(--accent-orange)' }} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Session Expiring</h3>
            </div>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Your session will expire in 1 minute due to inactivity. Do you want to stay logged in?
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={async () => {
                  await handleLogout();
                  setLogoutWarning(false);
                }}
              >
                Logout Now
              </Button>
              <Button
                onClick={() => {
                  // Reset timers by simulating activity
                  const event = new Event('mousedown');
                  document.dispatchEvent(event);
                  setLogoutWarning(false);
                }}
              >
                Stay Logged In
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

