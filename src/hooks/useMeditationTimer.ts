import { useState, useEffect, useRef } from 'react';

export const useMeditationTimer = (isActive: boolean, startTime: Date | null) => {
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && startTime) {
      intervalRef.current = window.setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setDuration(diff);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (!isActive) {
        setDuration(0);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, startTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return { duration, formatTime };
};
