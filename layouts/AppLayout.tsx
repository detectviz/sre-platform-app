
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { NavItem, User, PlatformSettings } from '../types';
import Icon from '../components/Icon';
import NotificationCenter from '../components/NotificationCenter';
import GlobalSearchModal from '../components/GlobalSearchModal';
import { showToast } from '../services/toast';
import api from '../services/api';
import { useUIConfig } from '../contexts/UIConfigContext';
import { useUser } from '../contexts/UserContext';
import { PAGE_CONTENT } from '../constants/pages';
import UserAvatar from '../components/UserAvatar';

const { APP_LAYOUT: content } = PAGE_CONTENT;

const AppLayout: React.FC = () => {
  const { navItems, tabConfigs, isLoading: isNavLoading } = useUIConfig();
  const { currentUser } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);

  useEffect(() => {
    const fetchPlatformData = async () => {
        try {
            const { data } = await api.get<PlatformSettings>('/settings/platform');
            setPlatformSettings(data);
        } catch (error) {
            console.error("Failed to fetch platform data", error);
            showToast('無法載入平台設定。', 'error');
        }
    };
    fetchPlatformData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
            setIsProfileMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            setIsSearchModalOpen(true);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const findLongestPrefixMatch = (pathname: string, items: NavItem[]): string | null => {
    let bestMatch: string | null = null;
    function traverse(items: NavItem[]) {
      for (const item of items) {
        if (pathname.startsWith(`/${item.key}`)) {
          if (!bestMatch || item.key.length > bestMatch.length) {
            bestMatch = item.key;
          }
        }
        if (item.children) {
          traverse(item.children);
        }
      }
    }
    traverse(items);
    return bestMatch;
  };

  const getActiveKey = () => {
    const path = location.pathname;

    if (path.startsWith('/dashboard/') || path.startsWith('/sre-war-room') || path === '/' || path === '/home') {
      return 'home';
    }
    
    const bestMatch = findLongestPrefixMatch(path, navItems);
    
    if (path.startsWith('/profile')) {
      return 'profile';
    }

    return bestMatch || path.substring(1);
  };

  const activeKey = getActiveKey();
  
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    let currentPath = '';
    const keysToOpen = pathParts.slice(0, -1).reduce<string[]>((acc, part) => {
        currentPath = acc.length > 0 ? `${acc[acc.length - 1]}/${part}` : part;
        acc.push(currentPath);
        return acc;
    }, []);

    setOpenKeys(prev => {
        const newKeys = new Set([...prev, ...keysToOpen]);
        return Array.from(newKeys);
    });
  }, [location.pathname]);

  const handleSubMenuToggle = (key: string) => {
    setOpenKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const findFirstLeaf = (item: NavItem): NavItem => {
    if (item.children && item.children.length > 0) {
      return findFirstLeaf(item.children[0]);
    }
    return item;
  };
  
  const handleSubMenuTitleClick = (item: NavItem) => {
    const firstChild = findFirstLeaf(item);
    navigate(`/${firstChild.key}`);
  };
  
  const handleLogout = (e: React.MouseEvent) => { 
      e.preventDefault();
      setIsProfileMenuOpen(false); 
      console.log('Logout action triggered.');
      showToast('您已成功登出。', 'success');
      setTimeout(() => {
        window.location.hash = '/';
        window.location.reload();
      }, 1000);
  };
  
  const handleHelp = (e: React.MouseEvent) => { 
      e.preventDefault(); 
      setIsProfileMenuOpen(false); 
      if (platformSettings?.helpUrl) {
          window.open(platformSettings.helpUrl, '_blank');
      } else {
          showToast('幫助中心 URL 尚未設定。', 'error');
      }
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const isSubmenuOpen = openKeys.includes(item.key);
    const hasActiveChild = item.children?.some(child => location.pathname.startsWith(`/${child.key}`));
    const isActive = activeKey === item.key;

    if (item.children) {
      return (
        <div key={item.key}>
          <div
            onClick={() => handleSubMenuToggle(item.key)}
            className={`flex items-center justify-between px-3 rounded-md cursor-pointer text-sm font-medium transition-colors whitespace-nowrap ${level > 0 ? 'py-2' : 'py-2.5'} ${
              (hasActiveChild) ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center" onClick={(e) => { e.stopPropagation(); handleSubMenuTitleClick(item); }}>
              <Icon name={item.icon} className="h-5 w-5 mr-3" />
              {!collapsed && <span>{item.label}</span>}
            </div>
            {!collapsed && <Icon name={isSubmenuOpen ? 'chevron-down' : 'chevron-right'} className="h-4 w-4 transition-transform" />}
          </div>
          {isSubmenuOpen && !collapsed && (
            <div className={`mt-1 pl-5`}>
              {item.children.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.key}
        to={`/${item.key}`}
        className={`flex items-center px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${level > 0 ? 'py-2' : 'py-2.5'} ${
          isActive ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
        title={collapsed ? item.label : ''}
      >
        <Icon name={`${item.icon}`} className={`${level > 0 ? 'h-4 w-4' : 'h-5 w-5'}`} />
        {!collapsed && <span className="ml-3">{item.label}</span>}
      </Link>
    );
  };

  const Breadcrumbs = () => {
    const { pathname } = useLocation();

    const crumbs = useMemo(() => {
        const result: { label: string; path: string }[] = [{ label: content.HOME_BREADCRUMB, path: '/home' }];
        if (pathname === '/home' || pathname === '/') return result;
        
        const tempCrumbs: { label: string; path: string }[] = [];
        let current = pathname;
        
        while(current && current !== '/') {
            let label: string | null = null;
            
            // 1. Search in nav items (recursive)
            const findNav = (items: NavItem[]): NavItem | null => {
                for (const item of items) {
                   if (`/${item.key}` === current) return item;
                   if (item.children) {
                       const found = findNav(item.children);
                       if (found) return found;
                   }
               }
               return null;
            }
            const navItem = findNav(navItems);
            if (navItem) {
                label = navItem.label;
            }
            
            // 2. Search in tab configs if not found in nav
            if (!label && tabConfigs) {
                for (const key in tabConfigs) {
                   const tab = tabConfigs[key].find(t => t.path === current);
                   if (tab) {
                       label = tab.label;
                       break;
                   }
               }
            }
            
            if (label) {
                // To avoid duplicate parent crumbs (e.g. Settings > Settings), we check if the new crumb is a parent of the last one added.
                if (!tempCrumbs.length || !tempCrumbs[0].path.startsWith(current)) {
                    tempCrumbs.unshift({ label, path: current });
                }
            }
            
            // Go to parent path
            const parentPath = current.substring(0, current.lastIndexOf('/'));
            current = parentPath === '' ? '/' : parentPath;
        }

        return [...result, ...tempCrumbs];

    }, [pathname, navItems, tabConfigs]);

    return (
        <div className="flex items-center text-sm text-slate-400">
            {crumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <Icon name="chevron-right" className="w-4 h-4 mx-1" />}
                    <Link to={crumb.path} className={`${index === crumbs.length - 1 ? 'text-white' : 'hover:text-white'}`}>{crumb.label}</Link>
                </React.Fragment>
            ))}
        </div>
    );
  };
  

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50">
      <aside className={`flex flex-col bg-slate-900 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex items-center h-12 px-4 border-b border-slate-800 shrink-0">
          <Icon name="deployment-unit" className="h-8 w-8 text-sky-400" />
          {!collapsed && <span className="ml-3 text-xl font-bold">{content.SIDEBAR_TITLE}</span>}
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {isNavLoading ? (
            <div className="flex justify-center items-center h-full">
                <Icon name="loader-circle" className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : (
            navItems.map(item => renderNavItem(item))
          )}
        </nav>
      </aside>
      <div className="flex flex-col flex-1">
        <header className="relative z-10 flex items-center justify-between h-12 px-6 glass-header shrink-0">
          <div className="flex items-center space-x-4">
            <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-full hover:bg-slate-700/50">
              <Icon name={collapsed ? 'menu-unfold' : 'menu-fold'} className="w-5 h-5" />
            </button>
            <Breadcrumbs />
          </div>
          <div className="flex items-center space-x-4">
             <div className="relative">
                <Icon name="search" className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder={content.SEARCH_PLACEHOLDER} 
                    className="w-64 bg-slate-800/80 border border-slate-700 rounded-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" 
                    readOnly 
                    onClick={() => setIsSearchModalOpen(true)}
                />
             </div>
             <NotificationCenter />
            <div className="relative" ref={profileMenuRef}>
                <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center space-x-2 p-1 rounded-lg hover:bg-slate-700/50">
                    <UserAvatar user={currentUser} className="w-8 h-8" iconClassName="w-5 h-5" />
                    <div className="text-sm text-left hidden md:block">
                        <div className="font-semibold">{currentUser?.name || 'Loading...'}</div>
                        <div className="text-xs text-slate-400">{currentUser?.email || '...'}</div>
                    </div>
                    <Icon name="chevron-down" className={`w-4 h-4 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 z-50 overflow-hidden animate-fade-in-down">
                        <div className="p-4 border-b border-slate-700/50">
                            <div className="font-semibold text-white">{currentUser?.name}</div>
                            <div className="text-sm text-slate-400">{currentUser?.email}</div>
                        </div>
                        <div className="p-2">
                            <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center w-full px-3 py-2 text-sm rounded-md text-slate-300 hover:bg-slate-700 hover:text-white">
                                <Icon name="user-cog" className="w-4 h-4 mr-3" />
                                {content.PROFILE_MENU.SETTINGS}
                            </Link>
                             <a href="#" onClick={handleHelp} className="flex items-center w-full px-3 py-2 text-sm rounded-md text-slate-300 hover:bg-slate-700 hover:text-white">
                                <Icon name="help-circle" className="w-4 h-4 mr-3" />
                                {content.PROFILE_MENU.HELP_CENTER}
                            </a>
                            <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-sm rounded-md text-slate-300 hover:bg-slate-700 hover:text-white">
                                <Icon name="log-out" className="w-4 h-4 mr-3" />
                                {content.PROFILE_MENU.LOGOUT}
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto" style={{ height: 'calc(100vh - 48px)'}}>
          <Outlet />
        </main>
      </div>
       <GlobalSearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
        />
    </div>
  );
};

export default AppLayout;