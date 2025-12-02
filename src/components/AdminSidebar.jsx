import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  FileText, 
  Settings, 
  LogOut, 
  Shield,
  Megaphone,
  Activity,
  MonitorPlay
} from 'lucide-react';
import { supabase } from '../lib/supabase';

import { ChevronLeft, ChevronRight } from 'lucide-react';

const AdminSidebar = ({ isCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/admin/fund-requests', icon: FileText, label: 'Fund Requests' },
    { path: '/admin/funds', icon: Database, label: 'Live Funds' },
    { path: '/admin/ad-requests', icon: Megaphone, label: 'Ad Requests' },
    { path: '/admin/ads', icon: MonitorPlay, label: 'Live Ads' },
    { path: '/admin/logs', icon: Activity, label: 'Audit Logs' },
  ];

  return (
    <div 
      className={`fixed left-0 top-0 h-screen bg-[#111] border-r border-white/10 transition-all duration-300 z-50 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-52'
      }`}
    >
      {/* Logo Area */}
      <div className={`h-14 flex items-center border-b border-white/5 ${
        isCollapsed ? 'justify-center px-0' : 'px-4'
      }`}>
        <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-base shrink-0">
          F
        </div>
        <span className={`font-display font-bold text-white text-base transition-opacity duration-200 ${
          isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 ml-3'
        }`}>
          FundsRank
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center px-3 py-2 rounded-lg transition-all duration-200 group relative
              ${isActive 
                ? 'bg-primary text-black shadow-[0_0_20px_rgba(234,179,8,0.2)]' 
                : 'text-text-muted hover:bg-white/5 hover:text-white'
              }
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            
            <span className={`text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 ml-3'
            }`}>
              {item.label}
            </span>

            {/* Tooltip */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1a1a1a] text-white text-xs font-medium rounded-md border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all duration-200 shadow-xl translate-x-2 group-hover:translate-x-0">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-2 border-t border-white/5 flex flex-col gap-1">
        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center px-3 py-2 rounded-lg text-text-muted hover:bg-white/5 hover:text-white transition-all duration-200 group ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 shrink-0" />
          ) : (
            <ChevronLeft className="w-4 h-4 shrink-0" />
          )}
          <span className={`text-xs font-medium whitespace-nowrap transition-all duration-200 ${
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 ml-3'
          }`}>
            Collapse
          </span>
        </button>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-200 group ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className={`text-xs font-medium whitespace-nowrap transition-all duration-200 ${
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 ml-3'
          }`}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
