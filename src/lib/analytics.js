import { supabase } from './supabase';

export const trackEvent = async (eventType, targetType, targetId, metadata = {}) => {
  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: eventType,
        target_type: targetType,
        target_id: targetId,
        metadata
      });

    if (error) {
      console.error('Error tracking event:', error);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};
