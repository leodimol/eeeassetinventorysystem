import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Bell,
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
  RefreshCw,
  LogOut,
  Database,
} from 'lucide-react';
import { Button } from './ui/Base';

const Sidebar = ({
  activePage,
  setActivePage,
  inventoryCount,
  isCollapsed,
  onToggle,
  onLogout,
  isMobile,
  onCloseMobile,
  alerts,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, badge: null },
    {
      id: 'inventory',
      label: 'Asset',
      icon: <Package size={20} />,
      badge: inventoryCount > 0 ? inventoryCount : null,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={20} />,
      badge: alerts?.unreadCount > 0 ? alerts.unreadCount : null,
    },
  ];

  const adminItems = [{ id: 'settings', label: 'Settings', icon: <Settings size={20} /> }];

  return (
    <div
      className={`flex flex-col h-screen shrink-0 glass-sidebar transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} ${isMobile ? 'backdrop-blur-xl' : ''}`}
      style={{ background: 'var(--bg-glass)' }}
    >
      <div className="p-4 border-b border-[var(--border-glass)] flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
          <img src="/sidebar.logo.png" alt="Logo" className="w-12 h-12 object-contain" />
        </div>
        {!isCollapsed && (
          <div className="flex-1">
            <h1
              className="font-bold text-lg leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Asset Inventory
            </h1>
            <p
              className="text-[10px] uppercase tracking-wider font-bold"
              style={{ color: 'var(--text-tertiary)' }}
            >
              System
            </p>
          </div>
        )}
        <div className="relative flex-shrink-0 ml-auto hidden lg:block">
          <button
            type="button"
            onClick={onToggle}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="p-3 rounded-lg transition-all duration-300 hover:scale-110"
            style={{
              color: 'var(--text-secondary)',
              background:
                'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(99, 102, 241, 0.12))',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.15)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(99, 102, 241, 0.18))';
              e.currentTarget.style.boxShadow =
                '0 0 0 1px rgba(59, 130, 246, 0.35), 0 6px 20px rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(99, 102, 241, 0.12))';
              e.currentTarget.style.boxShadow =
                '0 0 0 1px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.15)';
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
            type="button"
            onClick={onCloseMobile}
            className="p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-110 active:scale-95 lg:hidden"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto py-6 px-3 space-y-6 modern-scroll"
        style={{ overflow: 'visible' }}
      >
        <div>
          {!isCollapsed && (
            <p
              className="text-[10px] uppercase tracking-widest font-bold mb-3 px-3"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Main Menu
            </p>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item.id} className="relative" style={{ overflow: 'visible' }}>
                <button
                  type="button"
                  onClick={() => setActivePage(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all duration-200 group ${
                    activePage === item.id ? '' : 'hover:bg-white/5'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  style={
                    activePage === item.id
                      ? {
                          background:
                            'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                          color: 'white',
                        }
                      : {
                          color: 'var(--text-primary)',
                        }
                  }
                >
                  <div
                    className="flex items-center justify-center w-6 h-6"
                    style={{ color: activePage === item.id ? 'white' : 'var(--accent-tertiary)' }}
                  >
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.badge && (
                        <span
                          className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full animate-pulse"
                          style={{
                            background:
                              item.id === 'notifications'
                                ? 'var(--accent-orange)'
                                : activePage === item.id
                                  ? 'rgba(255,255,255,0.2)'
                                  : 'var(--bg-secondary)',
                            color:
                              item.id === 'notifications'
                                ? 'white'
                                : activePage === item.id
                                  ? 'white'
                                  : 'var(--text-secondary)',
                            boxShadow:
                              item.id === 'notifications'
                                ? '0 0 8px rgba(251, 191, 36, 0.4)'
                                : 'none',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
                {isCollapsed && hoveredItem === item.id && (
                  <div className="sidebar-tooltip">{item.label}</div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div>
          {!isCollapsed && (
            <p
              className="text-[10px] uppercase tracking-widest font-bold mb-3 px-3"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Admin
            </p>
          )}
          <nav className="space-y-1">
            {adminItems.map((item) => (
              <div key={item.id} className="relative" style={{ overflow: 'visible' }}>
                <button
                  type="button"
                  onClick={() => setActivePage(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all duration-200 group ${
                    activePage === item.id ? '' : 'hover:bg-white/5'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  style={
                    activePage === item.id
                      ? {
                          background:
                            'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                          color: 'white',
                        }
                      : {
                          color: 'var(--text-primary)',
                        }
                  }
                >
                  <div
                    className="flex items-center justify-center w-6 h-6"
                    style={{ color: activePage === item.id ? 'white' : 'var(--accent-tertiary)' }}
                  >
                    {item.icon}
                  </div>
                  {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                </button>
                {isCollapsed && hoveredItem === item.id && (
                  <div className="sidebar-tooltip">{item.label}</div>
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
              border: '1px solid var(--border-glass)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Database size={16} strokeWidth={2} style={{ color: 'var(--accent-primary)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                Database
              </span>
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  background: 'var(--accent-green)',
                  boxShadow: '0 0 8px var(--accent-green)',
                }}
              ></div>
            </div>
            <p className="text-[10px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
              Connected to Supabase
            </p>
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

export default Sidebar;
