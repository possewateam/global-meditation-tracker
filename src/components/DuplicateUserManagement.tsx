import { useState, useEffect } from 'react';
import { Users, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PotentialDuplicate {
  group_id: string;
  user_count: number;
  name: string;
  bk_centre_name: string;
  user_ids: string[];
  mobile_numbers: string[];
}

interface DuplicateUser {
  duplicate_user_id: string;
  duplicate_name: string;
  duplicate_mobile: string;
  duplicate_centre: string;
  primary_user_id: string;
  primary_name: string;
  primary_mobile: string;
  primary_centre: string;
  marked_at: string;
}

interface DuplicateStats {
  total_users: number;
  duplicate_users: number;
  primary_users: number;
  potential_duplicate_groups: number;
}

export const DuplicateUserManagement = () => {
  const [potentialDuplicates, setPotentialDuplicates] = useState<PotentialDuplicate[]>([]);
  const [markedDuplicates, setMarkedDuplicates] = useState<DuplicateUser[]>([]);
  const [stats, setStats] = useState<DuplicateStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<PotentialDuplicate | null>(null);
  const [primaryUserId, setPrimaryUserId] = useState<string>('');
  const [activeView, setActiveView] = useState<'potential' | 'marked'>('potential');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadPotentialDuplicates(),
      loadMarkedDuplicates(),
      loadStats(),
    ]);
    setLoading(false);
  };

  const loadPotentialDuplicates = async () => {
    try {
      const { data, error } = await supabase.rpc('detect_potential_duplicates');
      if (error) throw error;
      setPotentialDuplicates(data || []);
    } catch (error) {
      console.error('Error loading potential duplicates:', error);
    }
  };

  const loadMarkedDuplicates = async () => {
    try {
      const { data, error } = await supabase.rpc('get_duplicate_users_list');
      if (error) throw error;
      setMarkedDuplicates(data || []);
    } catch (error) {
      console.error('Error loading marked duplicates:', error);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_duplicate_statistics');
      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleMarkAsDuplicate = async (duplicateUserId: string, primaryUserId: string) => {
    try {
      const { data, error } = await supabase.rpc('mark_user_as_duplicate', {
        p_duplicate_user_id: duplicateUserId,
        p_primary_user_id: primaryUserId,
      });

      if (error) throw error;

      if (data?.success) {
        setMessage('User successfully marked as duplicate');
        await loadData();
        setSelectedGroup(null);
        setPrimaryUserId('');
      } else {
        setMessage(`Error: ${data?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error marking duplicate:', error);
      setMessage('Failed to mark user as duplicate');
    }
  };

  const handleUnmarkDuplicate = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('unmark_user_as_duplicate', {
        p_user_id: userId,
      });

      if (error) throw error;

      if (data?.success) {
        setMessage('User successfully unmarked as duplicate');
        await loadData();
      } else {
        setMessage(`Error: ${data?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error unmarking duplicate:', error);
      setMessage('Failed to unmark user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-teal-400" />
          <h2 className="text-2xl font-bold text-white">Duplicate User Management</h2>
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

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-teal-500/20">
            <div className="text-teal-400 text-sm mb-1">Total Users</div>
            <div className="text-2xl font-bold text-white">{stats.total_users}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-yellow-500/20">
            <div className="text-yellow-400 text-sm mb-1">Potential Duplicates</div>
            <div className="text-2xl font-bold text-white">{stats.potential_duplicate_groups}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-red-500/20">
            <div className="text-red-400 text-sm mb-1">Marked as Duplicates</div>
            <div className="text-2xl font-bold text-white">{stats.duplicate_users}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-green-500/20">
            <div className="text-green-400 text-sm mb-1">Primary Users</div>
            <div className="text-2xl font-bold text-white">{stats.primary_users}</div>
          </div>
        </div>
      )}

      {message && (
        <div className="bg-teal-500/20 border border-teal-500/50 rounded-lg p-4 text-teal-300">
          {message}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveView('potential')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeView === 'potential'
              ? 'bg-teal-500 text-white'
              : 'bg-white/10 text-teal-300 hover:bg-white/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Potential Duplicates
          </div>
        </button>
        <button
          onClick={() => setActiveView('marked')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeView === 'marked'
              ? 'bg-teal-500 text-white'
              : 'bg-white/10 text-teal-300 hover:bg-white/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Marked Duplicates ({markedDuplicates.length})
          </div>
        </button>
      </div>

      {activeView === 'potential' && (
        <div className="space-y-4">
          <div className="text-teal-300 text-sm">
            These are potential duplicate users detected by the system. Review each group and mark duplicates accordingly.
          </div>

          {potentialDuplicates.length === 0 ? (
            <div className="bg-white/5 rounded-lg p-8 text-center border border-teal-500/20">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-teal-300">No potential duplicates detected</p>
            </div>
          ) : (
            potentialDuplicates.map((group) => (
              <div key={group.group_id} className="bg-white/5 rounded-lg p-4 border border-yellow-500/20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-white font-semibold text-lg">{group.name}</div>
                    <div className="text-teal-400 text-sm">{group.bk_centre_name}</div>
                    <div className="text-yellow-400 text-sm mt-1">
                      {group.user_count} accounts found
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedGroup(selectedGroup?.group_id === group.group_id ? null : group)}
                    className="px-3 py-1 bg-teal-500 text-white rounded text-sm hover:bg-teal-600 transition-colors"
                  >
                    {selectedGroup?.group_id === group.group_id ? 'Cancel' : 'Manage'}
                  </button>
                </div>

                <div className="space-y-2">
                  {group.user_ids.map((userId, index) => (
                    <div
                      key={userId}
                      className="bg-white/5 rounded p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-white text-sm font-medium">
                          Account #{index + 1}
                        </div>
                        <div className="text-teal-300 text-xs">
                          Phone: {group.mobile_numbers[index] || 'N/A'}
                        </div>
                        <div className="text-teal-400 text-xs">
                          ID: {userId.substring(0, 8)}...
                        </div>
                      </div>

                      {selectedGroup?.group_id === group.group_id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPrimaryUserId(userId)}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                              primaryUserId === userId
                                ? 'bg-green-500 text-white'
                                : 'bg-white/10 text-teal-300 hover:bg-white/20'
                            }`}
                          >
                            Set as Primary
                          </button>
                          {primaryUserId && primaryUserId !== userId && (
                            <button
                              onClick={() => handleMarkAsDuplicate(userId, primaryUserId)}
                              className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                            >
                              Mark as Duplicate
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeView === 'marked' && (
        <div className="space-y-4">
          <div className="text-teal-300 text-sm">
            These users are currently marked as duplicates and hidden from the leaderboard.
          </div>

          {markedDuplicates.length === 0 ? (
            <div className="bg-white/5 rounded-lg p-8 text-center border border-teal-500/20">
              <XCircle className="w-12 h-12 text-teal-400 mx-auto mb-3" />
              <p className="text-teal-300">No users marked as duplicates</p>
            </div>
          ) : (
            markedDuplicates.map((dup) => (
              <div key={dup.duplicate_user_id} className="bg-white/5 rounded-lg p-4 border border-red-500/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="text-red-400 text-xs font-semibold mb-1">DUPLICATE ACCOUNT (Hidden)</div>
                      <div className="text-white font-semibold">{dup.duplicate_name}</div>
                      <div className="text-teal-400 text-sm">{dup.duplicate_centre}</div>
                      <div className="text-teal-300 text-xs">Phone: {dup.duplicate_mobile}</div>
                    </div>

                    <div className="border-t border-white/10 pt-3">
                      <div className="text-green-400 text-xs font-semibold mb-1">PRIMARY ACCOUNT (Visible)</div>
                      <div className="text-white font-semibold">{dup.primary_name}</div>
                      <div className="text-teal-400 text-sm">{dup.primary_centre}</div>
                      <div className="text-teal-300 text-xs">Phone: {dup.primary_mobile}</div>
                    </div>

                    <div className="text-xs text-teal-500">
                      Marked: {new Date(dup.marked_at).toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnmarkDuplicate(dup.duplicate_user_id)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-sm font-semibold"
                  >
                    Unmark
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
