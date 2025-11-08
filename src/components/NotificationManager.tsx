import { useState, useEffect } from 'react';
import { Bell, Plus, Edit2, Trash2, Eye, Send, Calendar, X, RefreshCw, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  title: string;
  body: string;
  audience_type: 'all' | 'centre' | 'language';
  audience_filter: any;
  send_at: string;
  repeat_rrule: string | null;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  channels: string[];
  created_by: string;
  created_at: string;
  sent_at: string | null;
}

interface DispatchLog {
  id: string;
  notification_id: string;
  dispatch_time: string;
  status: string;
  recipients_count: number;
  error_message: string | null;
}

interface NotificationFormData {
  title: string;
  body: string;
  audience_type: 'all' | 'centre' | 'language';
  audience_filter: {
    centres?: string[];
    languages?: string[];
  };
  send_at: string;
  repeat_rrule: string;
  channels: string[];
}

export const NotificationManager = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showLogs, setShowLogs] = useState<string | null>(null);
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLog[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [centres, setCentres] = useState<string[]>([]);
  const [languages] = useState(['en', 'hi', 'bn', 'ta', 'te', 'kn', 'ml', 'pa', 'or', 'de', 'fr', 'ru']);

  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    body: '',
    audience_type: 'all',
    audience_filter: {},
    send_at: '',
    repeat_rrule: '',
    channels: ['in_app'],
  });

  useEffect(() => {
    fetchNotifications();
    fetchCentres();
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
  };

  const fetchCentres = async () => {
    const { data } = await supabase
      .from('users')
      .select('centre_name')
      .not('centre_name', 'is', null);

    if (data) {
      const uniqueCentres = Array.from(new Set(data.map(u => u.centre_name)));
      setCentres(uniqueCentres);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const localDate = new Date(formData.send_at);

      const notificationData = {
        title: formData.title,
        body: formData.body,
        audience_type: formData.audience_type,
        audience_filter: formData.audience_filter,
        send_at: localDate.toISOString(),
        repeat_rrule: formData.repeat_rrule || null,
        status: 'scheduled' as const,
        channels: formData.channels,
        created_by: 'admin',
      };

      console.log('Creating notification with data:', notificationData);

      let result;
      if (editingId) {
        result = await supabase
          .from('notifications')
          .update(notificationData)
          .eq('id', editingId)
          .select();

        if (result.error) {
          console.error('Update error:', result.error);
          throw result.error;
        }
        setMessage('✓ Notification updated successfully!');
      } else {
        result = await supabase
          .from('notifications')
          .insert(notificationData)
          .select();

        if (result.error) {
          console.error('Insert error:', result.error);
          throw result.error;
        }
        setMessage('✓ Notification created successfully!');
      }

      console.log('Notification saved successfully:', result.data);
      await fetchNotifications();
      resetForm();
    } catch (error: any) {
      console.error('Error saving notification:', error);
      const errorMessage = error?.message || 'Failed to save notification. Please try again.';
      setMessage('✗ Error: ' + errorMessage);
      alert('Failed to save notification: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (notification: Notification) => {
    const utcDate = new Date(notification.send_at);
    const year = utcDate.getFullYear();
    const month = String(utcDate.getMonth() + 1).padStart(2, '0');
    const day = String(utcDate.getDate()).padStart(2, '0');
    const hours = String(utcDate.getHours()).padStart(2, '0');
    const minutes = String(utcDate.getMinutes()).padStart(2, '0');
    const localDateString = `${year}-${month}-${day}T${hours}:${minutes}`;

    setFormData({
      title: notification.title,
      body: notification.body,
      audience_type: notification.audience_type,
      audience_filter: notification.audience_filter || {},
      send_at: localDateString,
      repeat_rrule: notification.repeat_rrule || '',
      channels: notification.channels || ['in_app'],
    });
    setEditingId(notification.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    await fetchNotifications();
  };

  const handleCancel = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ status: 'cancelled' })
      .eq('id', id);

    await fetchNotifications();
  };

  const handleMarkAsSent = async (id: string) => {
    await supabase
      .from('notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', id);

    await fetchNotifications();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      audience_type: 'all',
      audience_filter: {},
      send_at: '',
      repeat_rrule: '',
      channels: ['in_app'],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleAudienceFilterChange = (key: string, value: string) => {
    const currentArray = formData.audience_filter[key as keyof typeof formData.audience_filter] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v: string) => v !== value)
      : [...currentArray, value];

    setFormData({
      ...formData,
      audience_filter: {
        ...formData.audience_filter,
        [key]: newArray,
      },
    });
  };

  const handleChannelToggle = (channel: string) => {
    setFormData({
      ...formData,
      channels: formData.channels.includes(channel)
        ? formData.channels.filter(c => c !== channel)
        : [...formData.channels, channel],
    });
  };

  const fetchDispatchLogs = async (notificationId: string) => {
    const { data } = await supabase
      .from('notification_dispatch_logs')
      .select('*')
      .eq('notification_id', notificationId)
      .order('dispatch_time', { ascending: false });

    if (data) {
      setDispatchLogs(data);
    }
  };

  const handleViewLogs = async (notificationId: string) => {
    await fetchDispatchLogs(notificationId);
    setShowLogs(notificationId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'scheduled': return 'bg-blue-500';
      case 'sent': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRepeatLabel = (rrule: string | null) => {
    if (!rrule) return null;
    if (rrule === 'FREQ=DAILY') return 'Daily';
    if (rrule === 'FREQ=WEEKLY') return 'Weekly';
    if (rrule === 'FREQ=MONTHLY') return 'Monthly';
    return rrule;
  };

  const isScheduledInFuture = (sendAt: string) => {
    return new Date(sendAt) > new Date();
  };

  const handleManualDispatch = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('trigger_notification_dispatch');

      if (error) throw error;

      alert(`Dispatch completed! Processed: ${data.processed} notifications`);
      await fetchNotifications();
    } catch (error) {
      console.error('Manual dispatch error:', error);
      alert('Failed to dispatch notifications. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-teal-400" />
          <h2 className="text-2xl font-bold text-white">Notification Manager</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleManualDispatch}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            Dispatch Now
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Notification
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.startsWith('✓') ? 'bg-green-500/20 border border-green-500/50 text-green-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-teal-900 to-blue-900 rounded-2xl p-8 max-w-2xl w-full shadow-2xl border border-teal-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {editingId ? 'Edit Notification' : 'Create Notification'}
              </h3>
              <button onClick={resetForm} className="text-teal-300 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-teal-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-teal-500/30 rounded-lg text-white placeholder-teal-400 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-teal-300 mb-2">Message</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/10 border border-teal-500/30 rounded-lg text-white placeholder-teal-400 focus:outline-none focus:border-teal-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-teal-300 mb-2">Audience</label>
                <select
                  value={formData.audience_type}
                  onChange={(e) => setFormData({ ...formData, audience_type: e.target.value as any, audience_filter: {} })}
                  className="w-full px-4 py-2 bg-white/10 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="all">All Users</option>
                  <option value="centre">By Centre</option>
                  <option value="language">By Language</option>
                </select>
              </div>

              {formData.audience_type === 'centre' && (
                <div>
                  <label className="block text-teal-300 mb-2">Select Centres</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-white/5 rounded-lg">
                    {centres.map((centre) => (
                      <label key={centre} className="flex items-center gap-2 text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.audience_filter.centres?.includes(centre)}
                          onChange={() => handleAudienceFilterChange('centres', centre)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{centre}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {formData.audience_type === 'language' && (
                <div>
                  <label className="block text-teal-300 mb-2">Select Languages</label>
                  <div className="grid grid-cols-3 gap-2 p-2 bg-white/5 rounded-lg">
                    {languages.map((lang) => (
                      <label key={lang} className="flex items-center gap-2 text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.audience_filter.languages?.includes(lang)}
                          onChange={() => handleAudienceFilterChange('languages', lang)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm uppercase">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-teal-300 mb-2">Send At (Local Time)</label>
                <input
                  type="datetime-local"
                  value={formData.send_at}
                  onChange={(e) => setFormData({ ...formData, send_at: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  required
                />
                <p className="text-teal-400 text-xs mt-1">
                  Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </p>
              </div>

              <div>
                <label className="block text-teal-300 mb-2">Repeat</label>
                <select
                  value={formData.repeat_rrule}
                  onChange={(e) => setFormData({ ...formData, repeat_rrule: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">No Repeat</option>
                  <option value="FREQ=DAILY">Daily</option>
                  <option value="FREQ=WEEKLY">Weekly</option>
                  <option value="FREQ=MONTHLY">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-teal-300 mb-2">Delivery Channels</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes('in_app')}
                      onChange={() => handleChannelToggle('in_app')}
                      className="w-4 h-4"
                    />
                    In-App
                  </label>
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes('web_push')}
                      onChange={() => handleChannelToggle('web_push')}
                      className="w-4 h-4"
                    />
                    Web Push
                  </label>
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes('email')}
                      onChange={() => handleChannelToggle('email')}
                      className="w-4 h-4"
                    />
                    Email
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Preview
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-teal-900 to-blue-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-teal-500/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Preview</h3>
              <button onClick={() => setShowPreview(false)} className="text-teal-300 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-white/10 rounded-lg p-4 border border-teal-500/30">
              <div className="flex items-start gap-3">
                <Bell className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2">{formData.title || 'Notification Title'}</h4>
                  <p className="text-teal-200 text-sm">{formData.body || 'Your notification message will appear here.'}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="w-full mt-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showLogs && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-teal-900 to-blue-900 rounded-2xl p-8 max-w-3xl w-full shadow-2xl border border-teal-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Dispatch History</h3>
              <button onClick={() => setShowLogs(null)} className="text-teal-300 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3">
              {dispatchLogs.length === 0 ? (
                <p className="text-teal-300 text-center py-8">No dispatch history yet</p>
              ) : (
                dispatchLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-lg border ${
                      log.status === 'success'
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold ${
                        log.status === 'success' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {log.status === 'success' ? 'Success' : 'Failed'}
                      </span>
                      <span className="text-teal-300 text-sm">
                        {new Date(log.dispatch_time).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-white text-sm">
                      Recipients: {log.recipients_count}
                    </div>
                    {log.error_message && (
                      <div className="text-red-300 text-sm mt-2">
                        Error: {log.error_message}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-gradient-to-br from-teal-900/40 to-blue-900/40 backdrop-blur-lg rounded-xl p-6 border border-teal-500/20"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{notification.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(notification.status)}`}>
                    {notification.status.toUpperCase()}
                  </span>
                  {notification.repeat_rrule && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-purple-500 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      {getRepeatLabel(notification.repeat_rrule)}
                    </span>
                  )}
                  {notification.status === 'scheduled' && isScheduledInFuture(notification.send_at) && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-amber-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Auto-Scheduled
                    </span>
                  )}
                </div>
                <p className="text-teal-200 mb-4">{notification.body}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-teal-400">Audience:</span>
                    <span className="text-white ml-2">{notification.audience_type}</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Send At:</span>
                    <span className="text-white ml-2">
                      {new Date(notification.send_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                      {' at '}
                      {new Date(notification.send_at).toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                      {' ('}
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}
                      {')'}
                    </span>
                  </div>
                  <div>
                    <span className="text-teal-400">Channels:</span>
                    <span className="text-white ml-2">{notification.channels.join(', ')}</span>
                  </div>
                  {notification.repeat_rrule && (
                    <div>
                      <span className="text-teal-400">Repeat:</span>
                      <span className="text-white ml-2">{getRepeatLabel(notification.repeat_rrule)}</span>
                    </div>
                  )}
                  {notification.sent_at && (
                    <div>
                      <span className="text-teal-400">Last Sent:</span>
                      <span className="text-white ml-2">
                        {new Date(notification.sent_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                        {' at '}
                        {new Date(notification.sent_at).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleViewLogs(notification.id)}
                  className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  title="View Dispatch History"
                >
                  <Calendar className="w-5 h-5" />
                </button>
                {notification.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => handleEdit(notification)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleMarkAsSent(notification.id)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      title="Mark as Sent"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleCancel(notification.id)}
                      className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      title="Cancel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-12 text-teal-300">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No notifications yet. Create your first notification!</p>
          </div>
        )}
      </div>
    </div>
  );
};
