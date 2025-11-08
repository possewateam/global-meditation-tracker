import { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
}

export const AnimatedCounter = ({ value, duration = 1000 }: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    const difference = endValue - startValue;

    if (difference === 0) return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const animate = () => {
      const now = Date.now();
      if (now >= endTime) {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
        return;
      }

      const progress = (now - startTime) / duration;
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + difference * easeProgress);
      setDisplayValue(currentValue);

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{displayValue}</>;
};
