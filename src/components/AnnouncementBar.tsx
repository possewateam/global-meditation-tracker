import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const AnnouncementBar = () => {
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    fetchAnnouncement();

    const channel = supabase
      .channel('announcement-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcement_settings' },
        () => {
          fetchAnnouncement();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchAnnouncement = async () => {
    const { data } = await supabase
      .from('announcement_settings')
      .select('*')
      .maybeSingle();

    if (data) {
      setMessage(data.message || '');
      setIsActive(data.is_active || false);
    }
  };

  if (!isActive || !message) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 border-b border-yellow-500/30 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap py-3 text-yellow-100 font-medium text-lg">
        <span className="inline-block px-4">{message}</span>
        <span className="inline-block px-4">{message}</span>
        <span className="inline-block px-4">{message}</span>
        <span className="inline-block px-4">{message}</span>
      </div>
    </div>
  );
};
