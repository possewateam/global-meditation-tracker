import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useWebPush = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return false;
    }

    if (!('serviceWorker' in navigator)) {
      console.error('This browser does not support service workers');
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        await subscribeToPush();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        setSubscription(existingSub);
        await savePushSubscription(existingSub);
        return existingSub;
      }

      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LhPVjjrU6lleSgm5rUZQbzL1mN0-bLRbE8tJRbGDXNNjlI';

      const newSub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setSubscription(newSub);
      await savePushSubscription(newSub);
      return newSub;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  };

  const savePushSubscription = async (sub: PushSubscription) => {
    try {
      const subJSON = sub.toJSON();

      await supabase.from('push_subscriptions').upsert({
        user_id: user?.id || null,
        endpoint: sub.endpoint,
        keys: {
          p256dh: subJSON.keys?.p256dh,
          auth: subJSON.keys?.auth,
        },
        user_agent: navigator.userAgent,
      }, {
        onConflict: 'endpoint',
      });
    } catch (error) {
      console.error('Error saving push subscription:', error);
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();

        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);

        setSubscription(null);
      }
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
    }
  };

  return {
    permission,
    subscription,
    requestPermission,
    unsubscribeFromPush,
  };
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
