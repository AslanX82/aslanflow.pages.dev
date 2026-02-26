
import React from 'react';
import { cn } from '@/lib/utils.js';

const TimelineAxis = ({ zoomFactor = 1, showLabels = true, showGrid = true }) => {
  const height = 1440 * zoomFactor;
  const pixelsPerMinute = zoomFactor;
  
  // Determine interval based on zoom factor to avoid clutter
  // zoomFactor 1 (1h) -> show every 60m
  // zoomFactor 2 (30m) -> show every 30m
  // zoomFactor 4 (15m) -> show every 15m
  // zoomFactor 12 (5m) -> show every 15m (5m is too cluttered for labels)
  const interval = zoomFactor === 1 ? 60 : zoomFactor === 2 ? 30 : 15;
  const slots = Math.floor(1440 / interval);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      {Array.from({ length: slots + 1 }).map((_, index) => {
        const minutes = index * interval;
        const top = minutes * pixelsPerMinute;
        const isHour = minutes % 60 === 0;

        return (
          <div
            key={index}
            className="absolute left-0 right-0 flex items-start pointer-events-none"
            style={{ top: `${top}px` }}
          >
            {showLabels && (
              <div className={cn(
                "w-16 text-right pr-3 text-xs font-medium -mt-2.5 bg-background/80 backdrop-blur-sm",
                isHour ? "text-foreground" : "text-muted-foreground"
              )}>
                {formatTime(minutes)}
              </div>
            )}
            {showGrid && (
              <div className={cn(
                "flex-1 border-t",
                isHour ? "border-border" : "border-border/30"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TimelineAxis;
