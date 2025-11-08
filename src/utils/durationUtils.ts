interface MeditationSession {
  id: string;
  start_time: string;
  end_time: string | null;
  is_active: boolean;
}

export const calculateEffectiveDuration = (
  startTime: string,
  endTime: string | null,
  now: Date = new Date()
): number => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : now;
  const durationMs = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(durationMs / 1000));
};

export const calculateTodayDuration = (
  startTime: string,
  endTime: string | null,
  now: Date = new Date()
): number => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : now;

  const localStartOfDay = new Date(now);
  localStartOfDay.setHours(0, 0, 0, 0);

  const localEndOfDay = new Date(localStartOfDay);
  localEndOfDay.setHours(23, 59, 59, 999);

  const overlapStart = Math.max(start.getTime(), localStartOfDay.getTime());
  const overlapEnd = Math.min(end.getTime(), localEndOfDay.getTime());

  const overlapMs = Math.max(0, overlapEnd - overlapStart);
  return Math.floor(overlapMs / 1000);
};

export const calculateCollectiveTotal = (sessions: MeditationSession[]): number => {
  const now = new Date();
  const uniqueSessions = new Map<string, MeditationSession>();

  sessions.forEach(session => {
    uniqueSessions.set(session.id, session);
  });

  let totalSeconds = 0;

  uniqueSessions.forEach(session => {
    const duration = calculateEffectiveDuration(session.start_time, session.end_time, now);
    totalSeconds += duration;
  });

  return totalSeconds;
};

export const calculateTodayTotal = (sessions: MeditationSession[]): number => {
  const now = new Date();
  const uniqueSessions = new Map<string, MeditationSession>();

  sessions.forEach(session => {
    uniqueSessions.set(session.id, session);
  });

  let totalSeconds = 0;

  uniqueSessions.forEach(session => {
    const duration = calculateTodayDuration(session.start_time, session.end_time, now);
    totalSeconds += duration;
  });

  return totalSeconds;
};

export const formatDuration = (totalSeconds: number): { minutes: number; seconds: number; formatted: string } => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${minutes}m ${seconds}s`;

  return { minutes, seconds, formatted };
};

export const formatMinutes = (totalSeconds: number): number => {
  return Math.floor(totalSeconds / 60);
};
