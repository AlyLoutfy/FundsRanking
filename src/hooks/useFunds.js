import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

export function useFunds() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useLanguage();

  useEffect(() => {
    async function fetchFunds() {
      try {
        const { data, error } = await supabase
          .from('funds')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Map DB columns to JS properties based on language
        const mappedFunds = data.map(fund => ({
          id: fund.id,
          name: language === 'ar' ? fund.name_ar : fund.name_en,
          manager: language === 'ar' ? (fund.manager_ar || fund.manager_en) : fund.manager_en,
          logo: fund.logo,
          annualReturn: parseFloat(fund.return_1y),
          ytdReturn: parseFloat(fund.return_ytd),
          category: fund.category, // Assuming category is same for both or mapped elsewhere
          risk: fund.risk_level,
          description: language === 'ar' ? (fund.description_ar || fund.description_en) : fund.description_en,
          strategy: language === 'ar' ? (fund.strategy_ar || fund.strategy_en) : fund.strategy_en,
          minInvestment: fund.min_investment || 0, // Ensure number
          fees: (fund.fees || 0) + '%', // Ensure string
          // Keep original DB fields if needed
          ...fund
        }));

        setFunds(mappedFunds);
      } catch (err) {
        console.error('Error fetching funds:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchFunds();

    // Real-time subscription
    const subscription = supabase
      .channel('public:funds')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'funds' }, (payload) => {
        console.log('Real-time update received:', payload);
        fetchFunds();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [language]);

  return { funds, loading, error };
}
