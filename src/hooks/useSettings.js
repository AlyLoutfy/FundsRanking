import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) throw error;

      // Convert array to object for easier access
      const settingsMap = {};
      data.forEach(item => {
        settingsMap[item.key] = item.value;
      });

      setSettings(settingsMap);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Real-time subscription
    const subscription = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const updateSetting = async (key, value) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

      if (error) throw error;
      
      // Optimistically update local state
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
      
      return { error: null };
    } catch (err) {
      console.error('Error updating setting:', err);
      return { error: err };
    }
  };

  return { settings, loading, error, updateSetting };
}
