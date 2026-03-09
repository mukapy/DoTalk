import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface RoomTimerProps {
  status: 'upcoming' | 'active' | 'inactive';
  createdAt: string;
}

// Helper function to format time
const formatTime = (timeInSeconds: number) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  
  const parts: string[] = [];
  if (hours > 0) parts.push(String(hours).padStart(2, '0'));
  parts.push(String(minutes).padStart(2, '0'));
  parts.push(String(seconds).padStart(2, '0'));
  
  return parts.join(':');
};

export default function RoomTimer({ status, createdAt }: RoomTimerProps) {
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    if (status !== 'active') {
      setDisplayTime('');
      return;
    }

    const calculateTime = () => {
      const now = new Date();
      const start = new Date(createdAt);
      const diff = (now.getTime() - start.getTime()) / 1000;
      return formatTime(Math.max(0, diff));
    };

    setDisplayTime(calculateTime());

    const interval = setInterval(() => {
      setDisplayTime(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [status, createdAt]);

  if (!displayTime) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-md">
      <Clock size={12} />
      <span>{displayTime}</span>
    </div>
  );
}
