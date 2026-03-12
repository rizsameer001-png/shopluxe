import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, ShoppingCart, Users,
  Settings, LogOut, ShoppingBag, BarChart3, Star, Upload, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { useAdminAuth } from '../../store/auth';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/categories', icon: Tag, label: 'Categories' },
  { path: '/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/users', icon: Users, label: 'Users' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} min-h-screen`}>
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-700">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-4 h-4 text-gray-900" />
        </div>
        {!collapsed && <span className="text-lg font-bold">ShopLux Admin</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`ml-auto text-gray-400 hover:text-white transition-colors ${collapsed ? 'mx-auto' : ''}`}>
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          return (
            <Link key={path} to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-gray-900 font-semibold'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-700">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold">{user.name?.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-red-900/50 hover:text-red-300 rounded-xl transition-all">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
