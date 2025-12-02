import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { supabase } from '../lib/supabase';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [counts, setCounts] = useState({
    fundRequests: 0,
    adRequests: 0,
    liveFunds: 0,
    liveAds: 0
  });

  useEffect(() => {
    fetchCounts();
    
    // Subscribe to changes
    const channel = supabase
      .channel('admin_counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fund_submissions' }, () => fetchCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, () => fetchCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'funds' }, () => fetchCounts())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCounts = async () => {
    try {
      const [
        { count: fundRequests },
        { count: adRequests },
        { count: liveFunds },
        { count: liveAds }
      ] = await Promise.all([
        supabase.from('fund_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('funds').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'active')
      ]);

      setCounts({
        fundRequests: fundRequests || 0,
        adRequests: adRequests || 0,
        liveFunds: liveFunds || 0,
        liveAds: liveAds || 0
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={() => setIsCollapsed(!isCollapsed)} 
        counts={counts}
      />
      <main 
        className={`flex-1 transition-all duration-300 w-full ${
          isCollapsed ? 'ml-16' : 'ml-52'
        }`}
      >
        <div className="p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
