import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useWebPush } from '../hooks/useWebPush';

export const PushNotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { permission, requestPermission } = useWebPush();

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('push_notification_prompt_seen');

    if (permission === 'default' && !hasSeenPrompt) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [permission]);

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      localStorage.setItem('push_notification_prompt_seen', 'true');
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('push_notification_prompt_seen', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt || permission !== 'default') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-in-right">
      <div className="bg-gradient-to-br from-teal-900 to-blue-900 rounded-xl p-6 shadow-2xl border border-teal-500/30 backdrop-blur-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
              <Bell className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">
              Enable Notifications
            </h3>
            <p className="text-teal-200 text-sm mb-4">
              Stay updated with meditation reminders and important announcements. Enable notifications now!
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleEnable}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
              >
                Enable
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 py-2 px-4 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300"
              >
                Not Now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-teal-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
