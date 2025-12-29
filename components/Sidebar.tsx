import React, { useState } from 'react';
import { BarChart3, BookOpen, Settings, ChevronLeft, ChevronRight, Menu, X, ChevronDown, Code, Users, Zap, Gamepad2, Shield } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  currentSubpage?: string;
  setCurrentPage: (page: string) => void;
  setCurrentSubpage?: (subpage: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  currentPage,
  currentSubpage,
  setCurrentPage,
  setCurrentSubpage,
  isMobileOpen = false,
  onMobileClose
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>('assessment');

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      submenu: null
    },
    {
      id: 'assessment',
      label: 'Assessment',
      icon: BookOpen,
      submenu: [
        { id: 'daftar-asesmen', label: 'Daftar Asesmen' },
        { id: 'hasil-asesmen', label: 'Hasil Asesmen' },
        { id: 'assessment-settings', label: 'Settings' },
      ]
    },
    {
      id: 'rpl',
      label: 'RPL',
      icon: Code,
      submenu: null
    },
    {
      id: 'absensi',
      label: 'Absensi Siswa',
      icon: Users,
      submenu: null
    },
    {
      id: 'latihan-tes',
      label: 'Latihan Tes',
      icon: Zap,
      submenu: null
    },
    {
      id: 'games',
      label: 'Games',
      icon: Gamepad2,
      submenu: null
    },
    {
      id: 'admin-accounts',
      label: 'Manajemen Admin',
      icon: Shield,
      submenu: null
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan',
      icon: Settings,
      submenu: null
    },
  ];

  const handleNavClick = (pageId: string, subpageId?: string) => {
    setCurrentPage(pageId);
    if (subpageId && setCurrentSubpage) {
      setCurrentSubpage(subpageId);
    }
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-slate-900 text-slate-300 shadow-xl transition-all duration-300 z-50 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'
          } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-slate-800 print:hidden`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between h-16 md:h-20">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="text-white" size={20} />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-base font-bold text-white">RUANG BK</h2>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isMenuExpanded = expandedMenu === item.id;
            const hasSubmenu = item.submenu && item.submenu.length > 0;

            return (
              <div key={item.id}>
                {/* Main Menu Item */}
                <button
                  onClick={() => {
                    if (hasSubmenu) {
                      toggleMenu(item.id);
                    } else {
                      handleNavClick(item.id);
                    }
                  }}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={20} className={`flex-shrink-0 transition-all duration-200 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-110 group-hover:-translate-y-0.5'}`} />
                  {!isCollapsed && (
                    <>
                      <span className={`font-medium flex-1 text-left text-sm ${isActive ? 'text-blue-100' : ''}`}>
                        {item.label}
                      </span>
                      {hasSubmenu && (
                        <ChevronDown
                          size={16}
                          className={`text-slate-500 transition-transform duration-200 ${isMenuExpanded ? 'rotate-180' : ''
                            }`}
                        />
                      )}
                    </>
                  )}
                </button>

                {/* Submenu Items */}
                {hasSubmenu && isMenuExpanded && !isCollapsed && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-800 pl-3 py-1">
                    {item.submenu!.map((subitem) => {
                      const isSubActive = currentPage === item.id && currentSubpage === subitem.id;
                      return (
                        <button
                          key={subitem.id}
                          onClick={() => handleNavClick(item.id, subitem.id)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${isSubActive
                            ? 'text-blue-400 font-medium bg-blue-600/5'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                            }`}
                        >
                          {subitem.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex w-full items-center justify-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!isCollapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
