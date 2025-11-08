import { useState, useEffect } from 'react';
import { Trophy, Search, UserX, UserCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardUser {
  id: string;
  name: string;
  mobile_e164: string | null;
  bk_centre_name: string;
  exclude_from_leaderboard: boolean;
  created_at: string;
}

interface UserWithRank extends LeaderboardUser {
  current_rank?: number;
  daily_seconds?: number;
  weekly_seconds?: number;
  monthly_seconds?: number;
}

export const LeaderboardManagement = () => {
  const [users, setUsers] = useState<UserWithRank[]>([]);
  const [excludedUsers, setExcludedUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'active' | 'excluded'>('active');
  const [confirmingExclusion, setConfirmingExclusion] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadActiveUsers(),
      loadExcludedUsers(),
    ]);
    setLoading(false);
  };

  const loadActiveUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, mobile_e164, bk_centre_name, exclude_from_leaderboard, created_at')
        .or('exclude_from_leaderboard.is.null,exclude_from_leaderboard.eq.false')
        .order('name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading active users:', error);
      setMessage('Failed to load active users');
    }
  };

  const loadExcludedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, mobile_e164, bk_centre_name, exclude_from_leaderboard, created_at')
        .eq('exclude_from_leaderboard', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setExcludedUsers(data || []);
    } catch (error) {
      console.error('Error loading excluded users:', error);
    }
  };

  const handleExcludeUser = async (userId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ exclude_from_leaderboard: true })
        .eq('id', userId);

      if (error) throw error;

      setMessage(`${userName} has been excluded from the leaderboard`);
      setConfirmingExclusion(null);
      await loadData();
    } catch (error) {
      console.error('Error excluding user:', error);
      setMessage('Failed to exclude user from leaderboard');
    }
  };

  const handleRestoreUser = async (userId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ exclude_from_leaderboard: false })
        .eq('id', userId);

      if (error) throw error;

      setMessage(`${userName} has been restored to the leaderboard`);
      await loadData();
    } catch (error) {
      console.error('Error restoring user:', error);
      setMessage('Failed to restore user to leaderboard');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.mobile_e164?.includes(searchQuery) ||
    user.bk_centre_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExcludedUsers = excludedUsers.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.mobile_e164?.includes(searchQuery) ||
    user.bk_centre_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Leaderboard Management</h2>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-lg p-4 border border-teal-500/20">
          <div className="text-teal-400 text-sm mb-1">Active Users</div>
          <div className="text-2xl font-bold text-white">{users.length}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-red-500/20">
          <div className="text-red-400 text-sm mb-1">Excluded from Leaderboard</div>
          <div className="text-2xl font-bold text-white">{excludedUsers.length}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-yellow-500/20">
          <div className="text-yellow-400 text-sm mb-1">Total Users</div>
          <div className="text-2xl font-bold text-white">{users.length + excludedUsers.length}</div>
        </div>
      </div>

      {message && (
        <div className="bg-teal-500/20 border border-teal-500/50 rounded-lg p-4 text-teal-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      <div className="bg-white/5 rounded-lg p-4 border border-teal-500/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, or BK centre..."
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveView('active')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeView === 'active'
              ? 'bg-teal-500 text-white'
              : 'bg-white/10 text-teal-300 hover:bg-white/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Active in Leaderboard ({users.length})
          </div>
        </button>
        <button
          onClick={() => setActiveView('excluded')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeView === 'excluded'
              ? 'bg-teal-500 text-white'
              : 'bg-white/10 text-teal-300 hover:bg-white/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4" />
            Excluded ({excludedUsers.length})
          </div>
        </button>
      </div>

      {activeView === 'active' && (
        <div className="space-y-3">
          <div className="text-teal-300 text-sm">
            These users are currently visible in the Top 100 Meditators leaderboard. Click "Exclude" to remove them from all leaderboard views.
          </div>

          {filteredUsers.length === 0 ? (
            <div className="bg-white/5 rounded-lg p-8 text-center border border-teal-500/20">
              <Trophy className="w-12 h-12 text-teal-400 mx-auto mb-3" />
              <p className="text-teal-300">
                {searchQuery ? 'No users found matching your search' : 'No active users found'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white/5 rounded-lg p-4 border border-teal-500/20 hover:border-teal-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-semibold text-lg">{user.name || 'Anonymous'}</div>
                      <div className="text-teal-400 text-sm">{user.bk_centre_name || 'No centre specified'}</div>
                      <div className="text-teal-300 text-xs mt-1">
                        Phone: {user.mobile_e164 || 'Not provided'}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {confirmingExclusion === user.id ? (
                        <>
                          <button
                            onClick={() => handleExcludeUser(user.id, user.name)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                          >
                            Confirm Exclude
                          </button>
                          <button
                            onClick={() => setConfirmingExclusion(null)}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmingExclusion(user.id)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors flex items-center gap-2"
                        >
                          <UserX className="w-4 h-4" />
                          Exclude from Leaderboard
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeView === 'excluded' && (
        <div className="space-y-3">
          <div className="text-red-300 text-sm">
            These users are currently hidden from the Top 100 Meditators leaderboard. Click "Restore" to make them visible again.
          </div>

          {filteredExcludedUsers.length === 0 ? (
            <div className="bg-white/5 rounded-lg p-8 text-center border border-teal-500/20">
              <UserCheck className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-teal-300">
                {searchQuery ? 'No excluded users found matching your search' : 'No users are currently excluded from the leaderboard'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExcludedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-red-500/10 rounded-lg p-4 border border-red-500/30 hover:border-red-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <UserX className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-xs font-semibold">EXCLUDED FROM LEADERBOARD</span>
                      </div>
                      <div className="text-white font-semibold text-lg">{user.name || 'Anonymous'}</div>
                      <div className="text-teal-400 text-sm">{user.bk_centre_name || 'No centre specified'}</div>
                      <div className="text-teal-300 text-xs mt-1">
                        Phone: {user.mobile_e164 || 'Not provided'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRestoreUser(user.id, user.name)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      Restore to Leaderboard
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
