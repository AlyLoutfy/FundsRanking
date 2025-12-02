import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../hooks/useSettings';
import { supabase } from '../lib/supabase';
import { formatDate, formatDateTime } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Database, FileText, Check, X, Loader2, AlertCircle, TrendingUp, Shield, DollarSign, Percent, Target, Search, Info as InfoIcon, Megaphone, MonitorPlay, Activity, ChevronDown, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import SubmissionDetailsModal from '../components/SubmissionDetailsModal';

const AdminDashboard = ({ initialTab = 'submissions' }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Dashboard Overview';
      case 'submissions': return 'Fund Requests';
      case 'funds': return 'Live Funds';
      case 'ads': return 'Ad Requests';
      case 'live_ads': return 'Live Ads';
      case 'logs': return 'Audit Logs';
      default: return 'Admin Dashboard';
    }
  };
  const [submissions, setSubmissions] = useState([]);
  const [liveFunds, setLiveFunds] = useState([]);
  const [ads, setAds] = useState([]);
  const [logs, setLogs] = useState([]);
  const [totalFunds, setTotalFunds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // ID of item being processed
  const [submissionFilter, setSubmissionFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [adFilter, setAdFilter] = useState('all'); // 'all', 'pending', 'active', 'rejected'
  const [adView, setAdView] = useState('requests'); // 'requests', 'live'
  const [fundSearchQuery, setFundSearchQuery] = useState('');
  const [managerFilter, setManagerFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null, // 'approve', 'reject', 'delete', 'edit_ad'
    data: null
  });
  const [detailsModalConfig, setDetailsModalConfig] = useState({
    isOpen: false,
    submission: null
  });
  const [editAdData, setEditAdData] = useState(null); // For editing ad details
  const [editFundData, setEditFundData] = useState(null);
  const [selectedFunds, setSelectedFunds] = useState(new Set());
  const [analytics, setAnalytics] = useState({ funds: {}, ads: {} });
  const { settings, updateSetting, loading: settingsLoading } = useSettings();
  const [editingPrice, setEditingPrice] = useState(null);
  
  // Refs for sliding tabs

  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchDashboardData();

    // Real-time subscriptions
    const fundsSubscription = supabase
      .channel('admin-funds')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'funds' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const submissionsSubscription = supabase
      .channel('admin-submissions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fund_submissions' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const adsSubscription = supabase
      .channel('admin-ads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(fundsSubscription);
      supabase.removeChannel(submissionsSubscription);
      supabase.removeChannel(adsSubscription);
    };
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Total Funds Count
      const { count, error: countError } = await supabase
        .from('funds')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (countError) throw countError;
      setTotalFunds(count || 0);

      // Fetch All Submissions
      const { data: subsData, error: subsError } = await supabase
        .from('fund_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;
      setSubmissions(subsData || []);

      // Fetch Live Funds
      const { data: fundsData, error: fundsError } = await supabase
        .from('funds')
        .select('*')
        .order('created_at', { ascending: false });

      if (fundsError) throw fundsError;
      setLiveFunds(fundsData || []);

      // Fetch Ads
      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (adsError) throw adsError;
      setAds(adsData || []);

      // Fetch Logs
      const { data: logsData, error: logsError } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Limit to last 50 logs

      if (logsError) throw logsError;
      setLogs(logsData || []);

      // Fetch Analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('analytics_events')
        .select('event_type, target_id, target_type');

      if (analyticsError) throw analyticsError;

      // Aggregate Analytics
      const agg = { funds: {}, ads: {} };
      let totalFundClicks = 0;
      let totalAdClicks = 0;

      analyticsData.forEach(event => {
        if (event.target_type === 'fund') {
          if (!agg.funds[event.target_id]) agg.funds[event.target_id] = { clicks: 0 };
          if (event.event_type === 'fund_click') {
            agg.funds[event.target_id].clicks++;
            totalFundClicks++;
          }
        } else if (event.target_type === 'ad') {
          if (!agg.ads[event.target_id]) agg.ads[event.target_id] = { views: 0, clicks: 0 };
          if (event.event_type === 'ad_view') agg.ads[event.target_id].views++;
          if (event.event_type === 'ad_click') {
            agg.ads[event.target_id].clicks++;
            totalAdClicks++;
          }
        }
      });

      // Attach totals
      Object.defineProperty(agg.funds, 'total_clicks', {
        value: totalFundClicks,
        enumerable: false // Keep it non-enumerable to be safe
      });
      Object.defineProperty(agg.ads, 'total_clicks', {
        value: totalAdClicks,
        enumerable: false
      });

      setAnalytics(agg);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const logAction = async (action, targetType, targetId, details = {}) => {
    if (!user) return;
    try {
      await supabase.from('admin_logs').insert([{
        admin_id: user.id,
        admin_email: user.email,
        action,
        target_type: targetType,
        target_id: targetId,
        details
      }]);
      // Refresh logs
      const { data } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setLogs(data);
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const executeApproveSubmission = async (submission) => {
    setActionLoading(submission.id);
    try {
      // 1. Insert into funds table
      const { error: insertError } = await supabase
        .from('funds')
        .insert([{
          name_en: submission.fund_name,
          name_ar: submission.fund_name, // Default to same name for now
          description_en: submission.description,
          description_ar: submission.description,
          category: submission.category,
          risk_level: submission.risk_level,
          return_1y: submission.return_1y,
          min_investment: submission.min_investment,
          fees: submission.fees,
          strategy_en: submission.strategy,
          strategy_ar: submission.strategy,
          manager_en: submission.manager || 'Unknown',
          manager_ar: submission.manager || 'Unknown',
          status: 'active'
        }]);

      if (insertError) throw insertError;

      // 2. Update submission status and tracking info
      const updates = {
        status: 'approved',
        processed_by_email: user?.email,
        processed_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('fund_submissions')
        .update(updates)
        .eq('id', submission.id);

      if (updateError) throw updateError;

      // 3. Log action
      await logAction('approve', 'submission', submission.id, { 
        fund_name: submission.fund_name,
        fund_manager: submission.manager 
      });

      // 4. Refresh local state (Update instead of filter)
      setSubmissions(prev => prev.map(s => s.id === submission.id ? { ...s, ...updates } : s));
      setTotalFunds(prev => prev + 1); // Increment total funds
      
      showToast(`Fund ${submission.fund_name} approved successfully`, 'success');

    } catch (error) {
      console.error('Error approving fund:', error);
      showToast('Error approving fund: ' + error.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveSubmission = (submission) => {
    setModalConfig({
      isOpen: true,
      title: 'Approve Submission',
      message: `Are you sure you want to approve "${submission.fund_name}"? This will publish the fund to the live website.`,
      type: 'success',
      confirmText: 'Approve & Publish',
      onConfirm: () => executeApproveSubmission(submission)
    });
  };

  const executeRejectSubmission = async (id, fundName) => {
    setActionLoading(id);
    try {
      const updates = {
        status: 'rejected',
        processed_by_email: user?.email,
        processed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('fund_submissions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Log action
      await logAction('reject', 'submission', id, { 
        fund_name: fundName,
        fund_manager: submissions.find(s => s.id === id)?.manager
      });

      // Update local state instead of removing
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      
      showToast(`Fund ${fundName} request rejected`, 'success');
    } catch (error) {
      console.error('Error rejecting submission:', error);
      showToast('Error rejecting submission', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmission = (id, fundName) => {
    setModalConfig({
      isOpen: true,
      title: 'Reject Submission',
      message: `Are you sure you want to reject "${fundName}"? You can re-approve it later if needed.`,
      type: 'danger',
      confirmText: 'Reject Submission',
      onConfirm: () => executeRejectSubmission(id, fundName)
    });
  };

  const executeToggleFundStatus = async (fund) => {
    setActionLoading(fund.id);
    const newStatus = fund.status === 'active' ? 'hidden' : 'active';
    try {
      const { error } = await supabase
        .rpc('toggle_fund_status', { 
          fund_id: fund.id, 
          new_status: newStatus 
        });

      if (error) throw error;

      // Log action
      await logAction('toggle_fund', 'fund', fund.id, { new_status: newStatus, fund_name: fund.name_en });

      setLiveFunds(prev => prev.map(f => f.id === fund.id ? { ...f, status: newStatus } : f));
      // Update total count if needed
      if (newStatus === 'active') setTotalFunds(prev => prev + 1);
      else setTotalFunds(prev => prev - 1);

      showToast(`Fund ${fund.name_en} ${newStatus === 'active' ? 'activated' : 'hidden'} successfully`, 'success');

    } catch (error) {
      console.error('Error updating fund:', error);
      showToast('Error updating fund status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFundStatus = (fund) => {
    const isHiding = fund.status === 'active';
    setModalConfig({
      isOpen: true,
      title: isHiding ? 'Hide Fund' : 'Activate Fund',
      message: isHiding 
        ? `Are you sure you want to hide "${fund.name_en}"? It will no longer be visible to users.` 
        : `Are you sure you want to activate "${fund.name_en}"? It will be visible to all users.`,
      type: isHiding ? 'danger' : 'success',
      confirmText: isHiding ? 'Hide Fund' : 'Activate Fund',
      onConfirm: () => executeToggleFundStatus(fund)
    });
  };

  const handleToggleAdStatus = async (ad) => {
    setActionLoading(ad.id);
    const newStatus = ad.status === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await supabase
        .rpc('toggle_ad_status', { 
          ad_id: ad.id, 
          new_status: newStatus 
        });

      if (error) throw error;

      // Log action
      await logAction('toggle_ad', 'ad', ad.id, { new_status: newStatus, company: ad.company_name });

      setAds(prev => prev.map(a => a.id === ad.id ? { ...a, status: newStatus } : a));
      
      showToast(`Ad ${ad.company_name} ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error) {
      console.error('Error updating ad:', error);
      showToast('Error updating ad status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineAd = async (ad) => {
    if (!confirm(`Are you sure you want to decline the ad request from ${ad.company_name}?`)) return;
    
    setActionLoading(ad.id);
    try {
      const { error } = await supabase
        .rpc('toggle_ad_status', { 
          ad_id: ad.id, 
          new_status: 'rejected' 
        });

      if (error) throw error;

      await logAction('reject_ad', 'ad', ad.id, { company: ad.company_name });
      setAds(prev => prev.map(a => a.id === ad.id ? { ...a, status: 'rejected' } : a));
      
      showToast(`Ad request from ${ad.company_name} declined`, 'success');
    } catch (error) {
      console.error('Error declining ad:', error);
      showToast('Error declining ad', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const moveAd = async (ad, direction) => {
    // Get all active ads sorted by current display order
    const activeAds = ads
        .filter(a => a.status === 'active')
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    
    const currentIndex = activeAds.findIndex(a => a.id === ad.id);
    if (currentIndex === -1) return;

    const targetIndex = currentIndex + direction;

    if (targetIndex < 0 || targetIndex >= activeAds.length) return;

    // Create a copy to modify
    const newActiveAds = [...activeAds];
    
    // Swap the items in the array
    [newActiveAds[currentIndex], newActiveAds[targetIndex]] = [newActiveAds[targetIndex], newActiveAds[currentIndex]];
    
    // Update display_order for all items based on new array position
    const updatedActiveAds = newActiveAds.map((item, idx) => ({
        ...item,
        display_order: idx + 1
    }));

    // Update the main ads state
    setAds(prevAds => {
        const otherAds = prevAds.filter(a => a.status !== 'active');
        return [...otherAds, ...updatedActiveAds].sort((a, b) => {
             // Sort by display_order for active, then created_at for others (or keep consistent)
             if (a.status === 'active' && b.status === 'active') {
                 return (a.display_order || 0) - (b.display_order || 0);
             }
             return new Date(b.created_at) - new Date(a.created_at);
        });
    });

    // Call RPC to save order
    try {
        const { error } = await supabase.rpc('reorder_ads', {
            ad_ids: updatedActiveAds.map(a => a.id)
        });
        if (error) throw error;
    } catch (err) {
        console.error('Error reordering ads:', err);
        // Revert logic could be added here
    }
  };

  const handlePromoteFund = async (fund) => {
    try {
      setActionLoading(fund.id);
      
      if (fund.is_promoted) {
        // If already promoted, clear it
        const { error } = await supabase.rpc('clear_promoted_funds');
        if (error) throw error;
        
        // Update local state: remove promotion from this fund
        setLiveFunds(prev => prev.map(f => ({
          ...f,
          is_promoted: false
        })));
        
        showToast(`Fund ${fund.name_en} promotion removed`, 'success');
        await logAction('unpromote_fund', 'fund', fund.id, { name: fund.name_en });
      } else {
        // If not promoted, promote it (and clear others)
        const { error } = await supabase.rpc('set_promoted_fund', { fund_id: fund.id });
        if (error) throw error;

        // Update local state: set this one to true, others to false
        setLiveFunds(prev => prev.map(f => ({
          ...f,
          is_promoted: f.id === fund.id
        })));
        
        showToast(`Fund ${fund.name_en} promoted successfully`, 'success');
        await logAction('promote_fund', 'fund', fund.id, { name: fund.name_en });
      }

    } catch (error) {
      console.error('Error updating promotion:', error);
      showToast('Error updating promotion', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditFund = (fund) => {
    setEditFundData({
      id: fund.id,
      name_en: fund.name_en,
      manager_en: fund.manager_en,
      category: fund.category,
      risk_level: fund.risk_level,
      return_1y: fund.return_1y,
      return_ytd: fund.return_ytd,
      return_3y: fund.return_3y,
      return_5y: fund.return_5y,
      min_investment: fund.min_investment,
      fees: fund.fees,
      description_en: fund.description_en,
      strategy_en: fund.strategy_en
    });
    setModalConfig({ isOpen: true, type: 'edit_fund', data: fund });
  };

  const saveFundChanges = async () => {
    if (!editFundData) return;
    setActionLoading(editFundData.id);
    
    try {
      const { error } = await supabase
        .from('funds')
        .update({
          name_en: editFundData.name_en,
          manager_en: editFundData.manager_en,
          category: editFundData.category,
          risk_level: editFundData.risk_level,
          return_1y: editFundData.return_1y,
          return_ytd: editFundData.return_ytd,
          return_3y: editFundData.return_3y,
          return_5y: editFundData.return_5y,
          min_investment: editFundData.min_investment,
          fees: editFundData.fees,
          description_en: editFundData.description_en,
          strategy_en: editFundData.strategy_en
        })
        .eq('id', editFundData.id);

      if (error) throw error;

      setLiveFunds(prev => prev.map(f => f.id === editFundData.id ? { ...f, ...editFundData } : f));
      
      // Close modal with animation
      handleCloseModal();
      
      showToast(`Fund ${editFundData.name_en} details updated successfully`, 'success');
    } catch (error) {
      console.error('Error updating fund:', error);
      showToast('Error updating fund details', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allFundIds = liveFunds
        .filter(f => 
          f.name_en.toLowerCase().includes(fundSearchQuery.toLowerCase()) || 
          f.manager_en.toLowerCase().includes(fundSearchQuery.toLowerCase())
        )
        .map(f => f.id);
      setSelectedFunds(new Set(allFundIds));
    } else {
      setSelectedFunds(new Set());
    }
  };

  const handleSelectFund = (id) => {
    const newSelected = new Set(selectedFunds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedFunds(newSelected);
  };

  const handleBulkAction = async (action) => {
    if (selectedFunds.size === 0) return;
    
    const confirmMessage = `Are you sure you want to ${action === 'active' ? 'activate' : 'hide'} ${selectedFunds.size} funds?`;
    
    setModalConfig({
      isOpen: true,
      title: action === 'active' ? 'Activate Funds' : 'Hide Funds',
      message: confirmMessage,
      type: action === 'active' ? 'success' : 'danger',
      confirmText: action === 'active' ? 'Activate' : 'Hide',
      onConfirm: () => executeBulkAction(action)
    });
  };

  const executeBulkAction = async (action) => {
    setActionLoading('bulk');
    try {
      const { error } = await supabase
        .rpc('bulk_update_fund_status', {
          fund_ids: Array.from(selectedFunds),
          new_status: action
        });

      if (error) throw error;

      setLiveFunds(prev => prev.map(f => 
        selectedFunds.has(f.id) ? { ...f, status: action } : f
      ));
      
      setSelectedFunds(new Set());
      await logAction('bulk_update', 'fund', 'bulk', { action, count: selectedFunds.size });
      
      showToast(`${selectedFunds.size} funds ${action === 'active' ? 'activated' : 'hidden'} successfully`, 'success');
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showToast('Error updating funds', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditAd = (ad) => {
    setEditAdData({
        id: ad.id,
        company_name: ad.company_name,
        image_url: ad.image_url || '',
        text_en: ad.text_en || '',
        expires_at: ad.expires_at ? new Date(ad.expires_at).toISOString().split('T')[0] : ''
    });
    setModalConfig({ isOpen: true, type: 'edit_ad', data: ad });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file', 'error');
        return;
    }

    // Validate file size (e.g., 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showToast('File size must be less than 2MB', 'error');
        return;
    }

    setActionLoading('uploading');
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `ads/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('logos')
            .getPublicUrl(filePath);

        setEditAdData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (error) {
        console.error('Error uploading file:', error);
        showToast('Error uploading file', 'error');
    } finally {
        setActionLoading(null);
    }
  };

  const saveAdChanges = async () => {
    if (!editAdData) return;
    setActionLoading(editAdData.id);
    
    try {
        const { error } = await supabase
            .from('ads')
            .update({
                image_url: editAdData.image_url,
                text_en: editAdData.text_en,
                expires_at: editAdData.expires_at || null
            })
            .eq('id', editAdData.id);

        if (error) throw error;

        setAds(prev => prev.map(a => a.id === editAdData.id ? { 
            ...a, 
            image_url: editAdData.image_url,
            text_en: editAdData.text_en,
            expires_at: editAdData.expires_at
        } : a));

        setModalConfig({ isOpen: false, type: null, data: null });
        setEditAdData(null);
        showToast(`Ad ${editAdData.company_name} details updated successfully`, 'success');
    } catch (error) {
        console.error('Error updating ad:', error);
        showToast('Error updating ad details', 'error');
    } finally {
        setActionLoading(null);
    }
  };

  // Helper to find submission for log entry
  const getSubmissionForLog = (log) => {
    if (log.target_type !== 'submission') return null;
    return submissions.find(s => s.id === log.target_id);
  };

  const [tabIndicatorStyle, setTabIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = React.useRef({});

  useEffect(() => {
    const activeTabElement = tabsRef.current[activeTab];
    if (activeTabElement) {
      setTabIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth
      });
    }
  }, [activeTab]);

  const handleCloseModal = () => {
    const modal = document.getElementById('edit-ad-modal');
    const backdrop = document.getElementById('edit-ad-backdrop');
    if (modal && backdrop) {
        modal.classList.remove('animate-sleekOpen');
        modal.classList.add('animate-sleekClose');
        backdrop.classList.remove('animate-fadeIn');
        backdrop.classList.add('animate-fadeOut');
        setTimeout(() => {
            setModalConfig({ isOpen: false, type: null, data: null });
            setEditAdData(null);
            setEditFundData(null);
        }, 300);
    } else {
        setModalConfig({ isOpen: false, type: null, data: null });
        setEditAdData(null);
        setEditFundData(null);
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
        if (e.key === 'Escape' && modalConfig.isOpen) {
            handleCloseModal();
        }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modalConfig.isOpen]);

  const handleUpdatePrice = async () => {
    if (!editingPrice) return;
    
    const amount = parseInt(editingPrice);
    if (isNaN(amount) || amount < 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    setActionLoading('price');
    try {
      const { error } = await updateSetting('ad_price', { 
        currency: 'EGP',
        period: 'month',
        ...settings.ad_price, 
        amount: amount
      });
      
      if (error) throw error;
      
      showToast('Ad price updated successfully', 'success');
      setEditingPrice(null);
    } catch (error) {
      console.error('Error updating price:', error);
      showToast(`Error updating price: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text font-sans">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen && !['edit_ad', 'edit_fund'].includes(modalConfig.type)}
        onClose={() => setModalConfig({ isOpen: false, type: null, data: null })}
        onConfirm={() => {
          if (modalConfig.onConfirm) {
            modalConfig.onConfirm();
          } else {
            if (modalConfig.type === 'approve') handleApprove(modalConfig.data);
            if (modalConfig.type === 'reject') handleReject(modalConfig.data);
            if (modalConfig.type === 'delete') handleDelete(modalConfig.data);
          }
        }}
        title={modalConfig.title || (
          modalConfig.type === 'approve' ? 'Approve Submission' :
          modalConfig.type === 'reject' ? 'Reject Submission' :
          'Delete Fund'
        )}
        message={modalConfig.message || (
          modalConfig.type === 'approve' ? `Are you sure you want to approve ${modalConfig.data?.fund_name}?` :
          modalConfig.type === 'reject' ? `Are you sure you want to reject ${modalConfig.data?.fund_name}?` :
          `Are you sure you want to delete ${modalConfig.data?.name_en}? This action cannot be undone.`
        )}
        confirmText={modalConfig.confirmText || (
          modalConfig.type === 'approve' ? 'Approve' :
          modalConfig.type === 'reject' ? 'Reject' :
          'Delete'
        )}
        type={modalConfig.type === 'approve' ? 'success' : 'danger'}
      />

      {/* Edit Ad Modal */}
      {modalConfig.isOpen && modalConfig.type === 'edit_ad' && (
          <div 
            id="edit-ad-backdrop" 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={(e) => {
                if (e.target.id === 'edit-ad-backdrop') handleCloseModal();
            }}
          >
              <div id="edit-ad-modal" className="bg-surface border border-border rounded-xl w-full max-w-md p-6 shadow-2xl animate-sleekOpen relative">
                  <button 
                    onClick={handleCloseModal}
                    className="absolute top-4 right-4 p-1 text-text-muted hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-bold text-white mb-4">Edit Advertisement</h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs text-text-muted mb-1.5">Company Name</label>
                          <input 
                              type="text" 
                              value={editAdData?.company_name || ''} 
                              disabled 
                              className="w-full bg-black/20 border border-border rounded-lg px-3 py-2 text-sm text-text-muted cursor-not-allowed"
                          />
                      </div>

                      <div>
                          <label className="block text-xs text-text-muted mb-1.5">Logo Image</label>
                          <div className="space-y-3">
                              {/* Preview Area */}
                              <div className="flex items-center gap-4">
                                  <div className="w-20 h-20 bg-black/20 border border-border rounded-lg flex items-center justify-center overflow-hidden relative group">
                                      {editAdData?.image_url ? (
                                          <>
                                              <img src={editAdData.image_url} alt="Preview" className="w-full h-full object-contain p-1" />
                                              <button
                                                  onClick={() => setEditAdData(prev => ({ ...prev, image_url: '' }))}
                                                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                              >
                                                  <X className="w-5 h-5 text-white" />
                                              </button>
                                          </>
                                      ) : (
                                          <span className="text-xs text-text-muted">No Logo</span>
                                      )}
                                  </div>
                                  
                                  <div className="flex-1">
                                      <input
                                          type="file"
                                          accept="image/*"
                                          onChange={handleFileUpload}
                                          className="hidden"
                                          id="logo-upload"
                                          disabled={actionLoading === 'uploading'}
                                      />
                                      <label
                                          htmlFor="logo-upload"
                                          className={`inline-flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white cursor-pointer transition-colors ${
                                              actionLoading === 'uploading' ? 'opacity-50 cursor-not-allowed' : ''
                                          }`}
                                      >
                                          {actionLoading === 'uploading' ? (
                                              <>
                                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                  Uploading...
                                              </>
                                          ) : (
                                              'Upload New Logo'
                                          )}
                                      </label>
                                      <p className="mt-2 text-[10px] text-text-muted">
                                          Recommended size: 200x100px. Max 2MB.
                                      </p>
                                  </div>
                              </div>

                              {/* URL Fallback */}
                              <div className="relative">
                                  <input 
                                      type="text" 
                                      value={editAdData?.image_url || ''} 
                                      onChange={(e) => setEditAdData({...editAdData, image_url: e.target.value})}
                                      placeholder="Or paste image URL..."
                                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-muted focus:outline-none focus:border-primary transition-colors"
                                  />
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs text-text-muted mb-1.5">Ad Text</label>
                          <input 
                              type="text" 
                              value={editAdData?.text_en || ''} 
                              onChange={(e) => setEditAdData({...editAdData, text_en: e.target.value})}
                              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                          />
                      </div>

                      <div>
                          <label className="block text-xs text-text-muted mb-1.5">Expiration Date</label>
                          <input 
                              type="date" 
                              value={editAdData?.expires_at || ''} 
                              onChange={(e) => setEditAdData({...editAdData, expires_at: e.target.value})}
                              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                          />
                          <div className="flex gap-2 mt-2">
                              <button 
                                  onClick={() => {
                                      const d = new Date();
                                      d.setMonth(d.getMonth() + 1);
                                      setEditAdData({...editAdData, expires_at: d.toISOString().split('T')[0]});
                                  }}
                                  className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-text-muted hover:text-white transition-colors"
                              >
                                  +1 Month
                              </button>
                              <button 
                                  onClick={() => {
                                      const now = new Date();
                                      // Get the last day of the current month
                                      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                                      // Adjust for timezone offset to ensure we get the correct local date string
                                      const offset = endOfMonth.getTimezoneOffset() * 60000;
                                      const localISOTime = new Date(endOfMonth.getTime() - offset).toISOString().split('T')[0];
                                      setEditAdData({...editAdData, expires_at: localISOTime});
                                  }}
                                  className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-text-muted hover:text-white transition-colors"
                              >
                                  End of Month
                              </button>
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                      <button 
                          onClick={handleCloseModal}
                          className="flex-1 px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-lg text-sm font-medium transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={saveAdChanges}
                          disabled={actionLoading === editAdData?.id}
                          className="flex-1 px-4 py-2 bg-primary text-black hover:bg-primary-hover rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                          {actionLoading === editAdData?.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      <SubmissionDetailsModal 
        isOpen={detailsModalConfig.isOpen}
        onClose={() => setDetailsModalConfig(prev => ({ ...prev, isOpen: false }))}
        submission={detailsModalConfig.submission}
      />

      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-surface border border-border rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-black/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              {activeTab === 'overview' && <LayoutDashboard className="w-6 h-6 text-primary" />}
              {activeTab === 'submissions' && <FileText className="w-6 h-6 text-primary" />}
              {activeTab === 'funds' && <Database className="w-6 h-6 text-primary" />}
              {activeTab === 'ads' && <Megaphone className="w-6 h-6 text-primary" />}
              {activeTab === 'live_ads' && <MonitorPlay className="w-6 h-6 text-primary" />}
              {activeTab === 'logs' && <Activity className="w-6 h-6 text-primary" />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-display">{getPageTitle()}</h1>
              <p className="text-xs text-text-muted mt-0.5">Manage your platform content</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white">
                  {user.user_metadata?.full_name || 'Admin'}
                </p>
                <p className="text-[10px] text-text-muted">{user.email}</p>
              </div>
            )}
            <div className="h-8 w-px bg-white/10 hidden md:block"></div>
            <button
              onClick={handleLogout}
              className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content Area */}
        <div className="space-y-6">
          
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Ad Revenue Card */}
              <div className="bg-surface border border-border rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <DollarSign className="w-16 h-16 text-green-400" />
                </div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                </div>
                <h3 className="text-text-muted text-sm font-medium relative z-10">Est. Monthly Revenue</h3>
                <p className="text-2xl font-bold text-white mt-1 relative z-10">
                  {settingsLoading ? (
                    <div className="relative flex h-6 w-6 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </div>
                  ) : (
                    new Intl.NumberFormat('en-US', { style: 'currency', currency: settings?.ad_price?.currency || 'EGP' }).format(
                      ads.filter(a => a.status === 'active').length * (settings?.ad_price?.amount || 10000)
                    )
                  )}
                </p>
                <p className="text-xs font-normal text-text-muted mt-1 relative z-10">
                  (from {ads.filter(a => a.status === 'active').length} active ads)
                </p>
                
                <div className="mt-4 pt-4 border-t border-white/5 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Ad Price / Month</span>
                    {editingPrice !== null ? (
                      <div className="flex gap-1 items-center z-20 relative">
                        <input 
                          type="number" 
                          value={editingPrice}
                          onChange={(e) => setEditingPrice(e.target.value)}
                          className="w-24 bg-black/40 border border-border rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdatePrice();
                          }}
                          className="p-1 bg-primary text-black rounded hover:bg-primary-hover flex items-center justify-center"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPrice(null);
                          }}
                          className="p-1 bg-white/10 text-white rounded hover:bg-white/20 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {settingsLoading ? (
                            <span className="inline-block w-20 h-5 bg-white/10 rounded animate-pulse"></span>
                          ) : (
                            new Intl.NumberFormat('en-US', { style: 'currency', currency: settings?.ad_price?.currency || 'EGP' }).format(settings?.ad_price?.amount || 10000)
                          )}
                        </span>
                        <button 
                          onClick={() => setEditingPrice(settings?.ad_price?.amount || 10000)}
                          className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Funds Overview Card */}
              <div className="bg-surface border border-border rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Database className="w-16 h-16 text-blue-400" />
                </div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Database className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-text-muted text-sm font-medium relative z-10">Active Funds</h3>
                <p className="text-2xl font-bold text-white mt-1 relative z-10 flex items-center gap-2">
                  {loading ? (
                    <div className="relative flex h-6 w-6 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </div>
                  ) : (
                    <>
                      {liveFunds.filter(f => f.status === 'active').length}
                      <span className="text-sm font-normal text-text-muted ml-2">
                        ({liveFunds.filter(f => f.status !== 'active').length} Hidden)
                      </span>
                    </>
                  )}
                </p>
                
                <div className="mt-4 pt-4 border-t border-white/5 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Top Performer (1Y)</span>
                  </div>
                  {liveFunds.length > 0 && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-medium text-white truncate max-w-[120px]">
                        {[...liveFunds].sort((a, b) => b.return_1y - a.return_1y)[0]?.name_en}
                      </span>
                      <span className="text-xs font-bold text-green-400">
                        {parseFloat([...liveFunds].sort((a, b) => b.return_1y - a.return_1y)[0]?.return_1y).toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submissions Card */}
              <div className="bg-surface border border-border rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FileText className="w-16 h-16 text-yellow-400" />
                </div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <FileText className="w-5 h-5 text-yellow-400" />
                  </div>
                  {submissions.filter(s => s.status === 'pending').length > 0 && (
                    <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full animate-pulse">
                      {submissions.filter(s => s.status === 'pending').length} Pending
                    </span>
                  )}
                </div>
                <h3 className="text-text-muted text-sm font-medium relative z-10">Total Requests</h3>
                <p className="text-2xl font-bold text-white mt-1 relative z-10">
                  {loading ? (
                    <div className="relative flex h-6 w-6 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                    </div>
                  ) : (
                    submissions.length
                  )}

                </p>
                
                <div className="mt-4 pt-4 border-t border-white/5 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Approval Rate</span>
                    <span className="text-xs font-bold text-white">
                      {submissions.length > 0 
                        ? Math.round((submissions.filter(s => s.status === 'approved').length / submissions.length) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-yellow-400 h-full rounded-full" 
                      style={{ width: `${submissions.length > 0 ? (submissions.filter(s => s.status === 'approved').length / submissions.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Engagement Card */}
              <div className="bg-surface border border-border rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Target className="w-16 h-16 text-purple-400" />
                </div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Target className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-text-muted text-sm font-medium relative z-10">Total Clicks</h3>
                <p className="text-2xl font-bold text-white mt-1 relative z-10">
                  {loading ? (
                    <div className="relative flex h-6 w-6 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </div>
                  ) : (
                    analytics.ads.total_clicks + analytics.funds.total_clicks
                  )}

                </p>
                
                <div className="mt-4 pt-4 border-t border-white/5 relative z-10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">Fund Clicks</span>
                    <span className="text-white">{analytics.funds.total_clicks}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">Ad Clicks</span>
                    <span className="text-white">{analytics.ads.total_clicks}</span>
                  </div>
                </div>
              </div>


            </div>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn" key={activeTab}>
            {activeTab === 'submissions' && (
              <>
                {/* Filters */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {['all', 'pending', 'approved', 'rejected'].map(filter => {
                    const count = filter === 'all' 
                      ? submissions.length 
                      : submissions.filter(s => s.status === filter).length;

                    return (
                      <button
                        key={filter}
                        onClick={() => setSubmissionFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                          submissionFilter === filter 
                            ? 'bg-white text-black' 
                            : 'bg-surface border border-border text-text-muted hover:text-white'
                        }`}
                      >
                        {filter} <span className="opacity-60 ml-0.5">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {submissions.filter(s => submissionFilter === 'all' || s.status === submissionFilter).length === 0 ? (
                  <div className="text-center py-12 text-text-muted bg-surface rounded-xl border border-border">
                    No submissions found
                  </div>
                ) : (
                  submissions
                    .filter(s => submissionFilter === 'all' || s.status === submissionFilter)
                    .map(sub => (
                    <div key={sub.id} className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-4">
                      {/* Header: Name, Manager, Status, Actions */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-white">{sub.fund_name || '-'}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              sub.status === 'approved' 
                                ? 'bg-green-500 text-black' 
                                : sub.status === 'pending'
                                ? 'bg-yellow-500 text-black'
                                : 'bg-red-500 text-white'
                            }`}>
                              {sub.status}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted">Managed by <span className="text-white font-medium">{sub.manager || '-'}</span></p>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex items-center gap-2">
                            {sub.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleRejectSubmission(sub.id, sub.fund_name)}
                                  disabled={actionLoading === sub.id}
                                  className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleApproveSubmission(sub)}
                                  disabled={actionLoading === sub.id}
                                  className="px-3 py-1.5 bg-primary text-black hover:bg-primary-hover rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {actionLoading === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                  Approve
                                </button>
                              </>
                            )}
                            {sub.status === 'rejected' && (
                              <button
                                onClick={() => handleApproveSubmission(sub)}
                                disabled={actionLoading === sub.id}
                                className="px-3 py-1.5 bg-primary text-black hover:bg-primary-hover rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {actionLoading === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Re-Approve
                              </button>
                            )}
                          </div>

                          {/* Processed By Info - Moved to right */}
                          {sub.processed_by_email && (
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-white/5 px-2 py-1.5 rounded-lg">
                              <InfoIcon className="w-3 h-3" />
                              <span>
                                Processed by <span className="text-gray-300">{sub.processed_by_email}</span>
                                <span className="hidden md:inline"> on {formatDate(sub.processed_at)}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Details Grid - 5 Columns for Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="bg-background/50 p-2 rounded-lg border border-border">
                          <div className="flex items-center gap-2 text-text-muted text-[10px] mb-0.5">
                            <Database className="w-3 h-3" />
                            Category
                          </div>
                          <p className="text-white text-sm font-medium">{sub.category || '-'}</p>
                        </div>
                        <div className="bg-background/50 p-2 rounded-lg border border-border">
                          <div className="flex items-center gap-2 text-text-muted text-[10px] mb-0.5">
                            <Shield className="w-3 h-3" />
                            Risk Level
                          </div>
                          <p className="text-white text-sm font-medium">{sub.risk_level || '-'}</p>
                        </div>
                        <div className="bg-background/50 p-2 rounded-lg border border-border">
                          <div className="flex items-center gap-2 text-text-muted text-[10px] mb-0.5">
                            <TrendingUp className="w-3 h-3" />
                            Annual Return
                          </div>
                          <p className={`text-sm font-bold ${sub.return_1y >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {sub.return_1y !== null && sub.return_1y !== undefined ? `${sub.return_1y}%` : '-'}
                          </p>
                        </div>
                        <div className="bg-background/50 p-2 rounded-lg border border-border">
                          <div className="flex items-center gap-2 text-text-muted text-[10px] mb-0.5">
                            <DollarSign className="w-3 h-3" />
                            Min Investment
                          </div>
                          <p className="text-white text-sm font-medium">{sub.min_investment?.toLocaleString() || '-'}</p>
                        </div>
                        <div className="bg-background/50 p-2 rounded-lg border border-border">
                          <div className="flex items-center gap-2 text-text-muted text-[10px] mb-0.5">
                            <Percent className="w-3 h-3" />
                            Fees
                          </div>
                          <p className="text-white text-sm font-medium">{sub.fees ? `${sub.fees}%` : '-'}</p>
                        </div>
                      </div>

                      {/* Strategy & Description - Side by Side */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-background/50 p-2 rounded-lg border border-border">
                          <div className="flex items-center gap-2 text-text-muted text-[10px] mb-0.5">
                            <Target className="w-3 h-3" />
                            Strategy
                          </div>
                          <p className="text-white text-xs leading-relaxed">{sub.strategy || '-'}</p>
                        </div>
                        <div className="bg-background/30 p-3 rounded-lg border border-border">
                          <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Description</h4>
                          <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{sub.description || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'funds' && (() => {
              // Filter Logic
              const managers = [...new Set(liveFunds.map(f => f.manager_en))].sort();
              
              const filteredFunds = liveFunds.filter(f => {
                const matchesSearch = f.name_en.toLowerCase().includes(fundSearchQuery.toLowerCase()) || 
                                      f.manager_en.toLowerCase().includes(fundSearchQuery.toLowerCase());
                const matchesManager = managerFilter === 'all' || f.manager_en === managerFilter;
                return matchesSearch && matchesManager;
              });

              // Pagination Logic
              const totalPages = Math.ceil(filteredFunds.length / itemsPerPage);
              const paginatedFunds = filteredFunds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

              return (
                <>
                  {/* Controls */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Search */}
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search funds by name or manager..."
                        value={fundSearchQuery}
                        onChange={(e) => { setFundSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    </div>

                    {/* Manager Filter */}
                    <div className="w-full md:w-64">
                      <div className="relative">
                        <select
                          value={managerFilter}
                          onChange={(e) => { setManagerFilter(e.target.value); setCurrentPage(1); }}
                          className="w-full bg-surface border border-border rounded-lg pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
                        >
                          <option value="all">All Managers</option>
                          {managers.map(manager => (
                            <option key={manager} value={manager}>{manager}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  {filteredFunds.length === 0 ? (
                    <div className="text-center py-12 bg-surface border border-border rounded-xl">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="w-6 h-6 text-text-muted" />
                      </div>
                      <p className="text-text-muted">No funds found matching your criteria</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-surface border border-border rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-[#1a1a1a] text-text-muted border-b border-border">
                              <tr>
                                <th className="px-4 py-2 w-10">
                                  <button
                                    onClick={(e) => {
                                      const allIds = paginatedFunds.map(f => f.id);
                                      const allSelected = allIds.every(id => selectedFunds.has(id));
                                      
                                      const newSelected = new Set(selectedFunds);
                                      if (allSelected) {
                                        allIds.forEach(id => newSelected.delete(id));
                                      } else {
                                        allIds.forEach(id => newSelected.add(id));
                                      }
                                      setSelectedFunds(newSelected);
                                    }}
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                      paginatedFunds.length > 0 && paginatedFunds.every(f => selectedFunds.has(f.id))
                                        ? 'bg-primary border-primary text-black' 
                                        : 'border-white/20 bg-white/5 hover:border-white/40'
                                    }`}
                                  >
                                    {paginatedFunds.length > 0 && paginatedFunds.every(f => selectedFunds.has(f.id)) && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                                  </button>
                                </th>
                                <th className="px-4 py-2 font-medium">Fund</th>
                                <th className="px-4 py-2 font-medium">Category / Risk</th>
                                <th className="px-4 py-2 font-medium text-center">Clicks</th>
                                <th className="px-4 py-2 font-medium text-right">Returns</th>
                                <th className="px-4 py-2 font-medium text-right">Min Inv / Fees</th>
                                <th className="px-4 py-2 font-medium text-center">Status</th>
                                <th className="px-4 py-2 font-medium text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {paginatedFunds.map(fund => (
                                <tr key={fund.id} className={`hover:bg-white/5 transition-colors group ${selectedFunds.has(fund.id) ? 'bg-white/5' : ''}`}>
                                  <td className="px-4 py-2">
                                    <button
                                      onClick={() => handleSelectFund(fund.id)}
                                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                        selectedFunds.has(fund.id) 
                                          ? 'bg-primary border-primary text-black' 
                                          : 'border-white/20 bg-white/5 hover:border-white/40'
                                      }`}
                                    >
                                      {selectedFunds.has(fund.id) && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                                    </button>
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="flex items-center gap-3">
                                      {fund.logo && (
                                        <img 
                                          src={fund.logo} 
                                          alt={fund.name_en} 
                                          className="w-8 h-8 rounded-lg object-cover bg-white/5"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                          }}
                                        />
                                      )}
                                      <div 
                                        className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs"
                                        style={{ display: fund.logo ? 'none' : 'flex' }}
                                      >
                                        {fund.name_en.substring(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <div className="font-medium text-white">{fund.name_en}</div>
                                        <div className="text-xs text-text-muted">{fund.manager_en}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="text-white">{fund.category}</div>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                      fund.risk_level === 'High' || fund.risk_level === 'Very High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                      fund.risk_level === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                      'bg-green-500/10 text-green-400 border-green-500/20'
                                    }`}>
                                      {fund.risk_level} Risk
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    <span className="text-white font-mono">{analytics.funds[fund.id]?.clicks || 0}</span>
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    <div className={`font-medium ${fund.return_1y >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {fund.return_1y}% <span className="text-[10px] text-text-muted">1Y</span>
                                    </div>
                                    <div className={`text-xs ${fund.return_ytd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {fund.return_ytd}% <span className="text-[10px] text-text-muted">YTD</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    <div className="text-white">{fund.min_investment?.toLocaleString()}</div>
                                    <div className="text-xs text-text-muted">{fund.fees}% Fees</div>
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                                      fund.status === 'active' 
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                      {fund.status === 'active' ? 'Active' : 'Hidden'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => handlePromoteFund(fund)}
                                        disabled={actionLoading === fund.id}
                                        className={`p-1.5 rounded-lg transition-colors ${
                                          fund.is_promoted 
                                            ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' 
                                            : 'bg-white/5 text-text-muted hover:text-yellow-400 hover:bg-white/10'
                                        }`}
                                        title={fund.is_promoted ? "Promoted Fund" : "Promote Fund"}
                                      >
                                        <Star className={`w-4 h-4 ${fund.is_promoted ? 'fill-yellow-400' : ''}`} />
                                      </button>
                                      <button
                                        onClick={() => handleEditFund(fund)}
                                        className="px-3 py-1.5 bg-white/5 text-white hover:bg-white/10 rounded-lg text-xs font-medium transition-colors"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleToggleFundStatus(fund)}
                                        disabled={actionLoading === fund.id}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                                          fund.status === 'active'
                                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                        }`}
                                      >
                                        {actionLoading === fund.id ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          fund.status === 'active' ? 'Hide' : 'Activate'
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-white/5 pt-2">
                          <div className="text-sm text-text-muted">
                            Showing <span className="text-white font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white font-medium">{Math.min(currentPage * itemsPerPage, filteredFunds.length)}</span> of <span className="text-white font-medium">{filteredFunds.length}</span> results
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <ChevronLeft className="w-4 h-4 text-white" />
                            </button>
                            <span className="text-sm text-white font-medium px-2">
                              Page {currentPage} of {totalPages}
                            </span>
                            <button
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <ChevronRight className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sticky Bulk Actions Toolbar */}
                  {selectedFunds.size > 0 && (
                    <div className="sticky bottom-6 z-40 w-full flex justify-center pointer-events-none animate-slideUp mt-4">
                      <div className="bg-[#222] border border-white/10 shadow-2xl rounded-full px-5 py-2.5 flex items-center gap-4 backdrop-blur-xl pointer-events-auto">
                        <span className="text-xs font-bold text-white whitespace-nowrap">
                          <span className="text-primary text-sm mr-1">{selectedFunds.size}</span> selected
                        </span>
                        <div className="h-4 w-px bg-white/10"></div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleBulkAction('active')}
                            disabled={actionLoading === 'bulk'}
                            className="px-4 py-1.5 bg-green-500 text-black hover:bg-green-400 rounded-full text-[10px] font-bold transition-all transform hover:scale-105 disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-green-500/20"
                          >
                            <Check className="w-3 h-3" strokeWidth={3} />
                            Activate
                          </button>
                          <button
                            onClick={() => handleBulkAction('hidden')}
                            disabled={actionLoading === 'bulk'}
                            className="px-4 py-1.5 bg-red-500 text-white hover:bg-red-600 rounded-full text-[10px] font-bold transition-all transform hover:scale-105 disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-red-500/20"
                          >
                            <X className="w-3 h-3" strokeWidth={3} />
                            Hide
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {activeTab === 'ads' && (
              <>
                  {ads.filter(a => ['pending', 'rejected'].includes(a.status)).length === 0 ? (
                    <div className="text-center py-12 text-text-muted bg-surface rounded-xl border border-border">
                      No pending or rejected ad requests
                    </div>
                  ) : (
                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[#1a1a1a] text-text-muted border-b border-border">
                            <tr>
                              <th className="px-4 py-2 font-medium">Preview</th>
                              <th className="px-4 py-2 font-medium">Company</th>
                              <th className="px-4 py-2 font-medium">Contact</th>
                              <th className="px-4 py-2 font-medium text-center">Status</th>
                              <th className="px-4 py-2 font-medium text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {ads
                              .filter(a => ['pending', 'rejected'].includes(a.status))
                              .map((ad) => (
                              <tr key={ad.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-2">
                                  <div className="w-32 h-16 bg-surface border border-border rounded-lg flex items-center justify-center overflow-hidden">
                                      {ad.image_url ? (
                                          <img src={ad.image_url} alt={ad.company_name} className="w-full h-full object-contain p-2" />
                                      ) : (
                                          <span className="text-[10px] text-text-muted text-center px-2">{ad.text_en || 'No Content'}</span>
                                      )}
                                  </div>
                                </td>
                                <td className="px-4 py-2 font-bold text-white">
                                  {ad.company_name}
                                  {ad.text_en && (
                                    <span className="block text-xs text-text-muted font-normal mt-1 max-w-[200px] truncate">
                                      {ad.text_en}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-text-muted">
                                  {ad.email}
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    ad.status === 'pending'
                                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  }`}>
                                    {ad.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                      {ad.status === 'pending' && (
                                          <button
                                              onClick={() => handleDeclineAd(ad)}
                                              disabled={actionLoading === ad.id}
                                              className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                          >
                                              Decline
                                          </button>
                                      )}
                                      <button
                                          onClick={() => handleToggleAdStatus(ad)}
                                          disabled={actionLoading === ad.id}
                                          className="px-3 py-1.5 bg-primary text-black hover:bg-primary-hover rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                      >
                                          {actionLoading === ad.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                          {ad.status === 'rejected' ? 'Re-Approve' : 'Approve'}
                                      </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </>
            )}
            {activeTab === 'live_ads' && (
              <>
                  {/* Filters */}
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {['all', 'active', 'inactive'].map(filter => {
                      const count = filter === 'all' 
                        ? ads.filter(a => ['active', 'inactive'].includes(a.status)).length 
                        : ads.filter(a => a.status === filter).length;

                      return (
                        <button
                          key={filter}
                          onClick={() => setAdFilter(filter)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                            adFilter === filter 
                              ? 'bg-white text-black' 
                              : 'bg-surface border border-border text-text-muted hover:text-white'
                          }`}
                        >
                          {filter} <span className="opacity-60 ml-0.5">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                  {ads.filter(a => ['active', 'inactive'].includes(a.status)).length === 0 ? (
                    <div className="text-center py-12 text-text-muted bg-surface rounded-xl border border-border">
                      No live ads found
                    </div>
                  ) : (
                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[#1a1a1a] text-text-muted border-b border-border">
                            <tr>
                              <th className="px-4 py-2 font-medium">Order</th>
                              <th className="px-4 py-2 font-medium">Preview</th>
                              <th className="px-4 py-2 font-medium">Company</th>
                              <th className="px-4 py-2 font-medium">Contact</th>
                              <th className="px-4 py-2 font-medium text-center">Status</th>
                              <th className="px-4 py-2 font-medium text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {ads
                              .filter(a => ['active', 'inactive'].includes(a.status))
                              .map((ad, index) => (
                              <tr key={ad.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-2 text-text-muted">
                                  {ad.status === 'active' ? (
                                      <div className="flex flex-col gap-1">
                                          <button 
                                              onClick={() => moveAd(ad, -1)}
                                              disabled={index === 0}
                                              className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                                          >
                                              <TrendingUp className="w-3 h-3 rotate-0" />
                                          </button>
                                          <button 
                                              onClick={() => moveAd(ad, 1)}
                                              disabled={index === ads.filter(a => ['active', 'inactive'].includes(a.status)).length - 1}
                                              className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                                          >
                                              <TrendingUp className="w-3 h-3 rotate-180" />
                                          </button>
                                      </div>
                                  ) : (
                                      <span className="text-xs">#</span>
                                  )}
                                </td>
                                <td className="px-4 py-2">
                                  <div className="w-32 h-16 bg-surface border border-border rounded-lg flex items-center justify-center overflow-hidden">
                                      {ad.image_url ? (
                                          <img src={ad.image_url} alt={ad.company_name} className="w-full h-full object-contain p-2" />
                                      ) : (
                                          <span className="text-[10px] text-text-muted text-center px-2">{ad.text_en || 'No Content'}</span>
                                      )}
                                  </div>
                                </td>
                                <td className="px-4 py-2 font-bold text-white">
                                  {ad.company_name}
                                  {ad.text_en && (
                                    <span className="block text-xs text-text-muted font-normal mt-1 max-w-[200px] truncate">
                                      {ad.text_en}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-text-muted">
                                  {ad.email}
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    ad.status === 'active' 
                                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                      : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                  }`}>
                                    {ad.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleEditAd(ad)}
                                      className="px-3 py-1.5 bg-white/5 text-white hover:bg-white/10 rounded-lg text-xs font-medium transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleToggleAdStatus(ad)}
                                      disabled={actionLoading === ad.id}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                                        ad.status === 'active'
                                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                          : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                      }`}
                                    >
                                      {actionLoading === ad.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        ad.status === 'active' ? 'Hide' : 'Activate'
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </>
            )}

            {activeTab === 'logs' && (
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#1a1a1a] text-text-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-4 font-medium">Admin</th>
                        <th className="px-6 py-4 font-medium">Activity</th>
                        <th className="px-6 py-4 font-medium">Item</th>
                        <th className="px-6 py-4 font-medium">Details</th>
                        <th className="px-6 py-4 font-medium text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-text-muted">
                            No logs found
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr key={log.id} className="hover:bg-white/5 transition-colors">
                            {/* Admin */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                  {log.admin_email[0].toUpperCase()}
                                </div>
                                <span className="text-white text-sm">{log.admin_email}</span>
                              </div>
                            </td>

                            {/* Activity */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex self-start items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  log.action === 'approve' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                  log.action === 'reject' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                  log.action === 'delete' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>
                                  {log.action.replace(/_/g, ' ')}
                                </span>
                                <span className="text-xs text-text-muted flex items-center gap-1.5">
                                  {log.target_type === 'submission' ? <FileText className="w-3 h-3" /> : 
                                   log.target_type === 'fund' ? <Database className="w-3 h-3" /> : 
                                   <Megaphone className="w-3 h-3" />}
                                  {log.target_type === 'submission' ? 'Fund Request' : 
                                   log.target_type === 'fund' ? 'Live Fund' : 
                                   'Ad Request'}
                                </span>
                              </div>
                            </td>

                            {/* Item */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-white font-medium">
                                  {log.details?.fund_name || log.details?.name || log.details?.company || 'Unknown Item'}
                                </span>
                                {log.details?.fund_manager && (
                                  <span className="text-xs text-text-muted">{log.details.fund_manager}</span>
                                )}
                              </div>
                            </td>

                            {/* Details */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                {log.details?.new_status && (
                                  <span className={`text-xs font-medium ${
                                    log.details.new_status === 'active' ? 'text-green-400' : 
                                    log.details.new_status === 'rejected' ? 'text-red-400' :
                                    log.details.new_status === 'inactive' ? 'text-text-muted' :
                                    'text-white'
                                  }`}>
                                    Status: {log.details.new_status.charAt(0).toUpperCase() + log.details.new_status.slice(1)}
                                  </span>
                                )}

                                {log.action === 'promote_fund' && (
                                  <span className="text-xs font-medium text-yellow-400">
                                    Marked as Promoted
                                  </span>
                                )}

                                {log.action === 'unpromote_fund' && (
                                  <span className="text-xs font-medium text-text-muted">
                                    Removed Promotion
                                  </span>
                                )}
                                
                                {!log.details?.fund_name && !log.details?.name && !log.details?.company && !log.details?.new_status && log.action !== 'promote_fund' && log.action !== 'unpromote_fund' && (
                                  <span className="text-xs text-text-muted font-mono bg-black/20 px-2 py-1 rounded">
                                    {JSON.stringify(log.details).slice(0, 50)}...
                                  </span>
                                )}

                                {log.target_type === 'submission' && getSubmissionForLog(log) && (
                                  <button
                                    onClick={() => setDetailsModalConfig({ isOpen: true, submission: getSubmissionForLog(log) })}
                                    className="text-xs text-primary hover:text-primary-hover underline underline-offset-4 whitespace-nowrap self-start"
                                  >
                                    View Request
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Time */}
                            <td className="px-6 py-4 text-right text-text-muted whitespace-nowrap">
                              {formatDateTime(log.created_at)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
            {modalConfig.isOpen && modalConfig.type === 'edit_fund' && (
              <div id="edit-fund-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={handleCloseModal}>
                <div id="edit-fund-modal" className="bg-surface border border-border rounded-xl w-full max-w-2xl p-6 shadow-2xl animate-sleekOpen max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Edit Fund Details</h3>
                    <button onClick={handleCloseModal} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <X className="w-5 h-5 text-text-muted" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-text-muted mb-1.5">Fund Name (EN)</label>
                        <input
                          type="text"
                          value={editFundData?.name_en || ''}
                          onChange={e => setEditFundData(prev => ({ ...prev, name_en: e.target.value }))}
                          className="w-full bg-black/20 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-muted mb-1.5">Fund Manager (EN)</label>
                        <input
                          type="text"
                          value={editFundData?.manager_en || ''}
                          onChange={e => setEditFundData(prev => ({ ...prev, manager_en: e.target.value }))}
                          className="w-full bg-black/20 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Classification */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-text-muted mb-1.5">Category</label>
                        <div className="relative">
                          <select
                            value={editFundData?.category || ''}
                            onChange={e => setEditFundData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full bg-black/20 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary appearance-none"
                          >
                            {['Equity', 'Fixed Income', 'Balanced', 'Islamic', 'Money Market', 'Gold'].map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-text-muted mb-1.5">Risk Level</label>
                        <div className="relative">
                          <select
                            value={editFundData?.risk_level || ''}
                            onChange={e => setEditFundData(prev => ({ ...prev, risk_level: e.target.value }))}
                            className="w-full bg-black/20 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary appearance-none"
                          >
                            {['Low', 'Medium', 'High', 'Very High'].map(risk => (
                              <option key={risk} value={risk}>{risk}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Performance */}
                    <div>
                      <label className="block text-xs text-text-muted mb-2">Performance Returns (%)</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['return_1y', 'return_ytd', 'return_3y', 'return_5y'].map(field => (
                          <div key={field}>
                            <label className="block text-[10px] text-text-muted mb-1 uppercase">{field.replace('return_', '').replace('_', ' ')}</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editFundData?.[field] ?? ''}
                              onChange={e => setEditFundData(prev => ({ ...prev, [field]: e.target.value ? parseFloat(e.target.value) : null }))}
                              className="w-full bg-black/20 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Investment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-text-muted mb-1.5">Min Investment</label>
                        <input
                          type="number"
                          value={editFundData?.min_investment || ''}
                          onChange={e => setEditFundData(prev => ({ ...prev, min_investment: parseFloat(e.target.value) }))}
                          className="w-full bg-black/20 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-muted mb-1.5">Fees (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editFundData?.fees || ''}
                          onChange={e => setEditFundData(prev => ({ ...prev, fees: parseFloat(e.target.value) }))}
                          className="w-full bg-black/20 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Text Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-text-muted mb-1.5">Description (EN)</label>
                        <textarea
                          rows="3"
                          value={editFundData?.description_en || ''}
                          onChange={e => setEditFundData(prev => ({ ...prev, description_en: e.target.value }))}
                          className="w-full bg-black/20 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-muted mb-1.5">Strategy (EN)</label>
                        <textarea
                          rows="2"
                          value={editFundData?.strategy_en || ''}
                          onChange={e => setEditFundData(prev => ({ ...prev, strategy_en: e.target.value }))}
                          className="w-full bg-black/20 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary resize-none"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <button
                        onClick={handleCloseModal}
                        className="px-4 py-2 text-sm font-medium text-text-muted hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveFundChanges}
                        disabled={actionLoading === editFundData?.id}
                        className="px-6 py-2 bg-primary text-black rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading === editFundData?.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Confirmation Modal */}
            <ConfirmationModal
              isOpen={modalConfig.isOpen && !['edit_fund', 'edit_ad', 'approve', 'reject'].includes(modalConfig.type)}
              onClose={() => setModalConfig({ isOpen: false, type: null, data: null })}
              onConfirm={modalConfig.onConfirm}
              title={modalConfig.title}
              message={modalConfig.message}
              type={modalConfig.type}
              confirmText={modalConfig.confirmText}
            />
    </div>
  );
};



export default AdminDashboard;
