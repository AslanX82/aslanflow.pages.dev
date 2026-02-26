
import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import { calculatePosition, calculateHeight, snapToGrid, pixelsToMinutes, formatTimeHint } from '@/lib/timelineSync.js';

const TaskBlock = ({ task, timeSpent = 0, onClick, onUpdate, zoomFactor = 1, startMinute = 480, projectColor = '#5B7FFF' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null); // 'move', 'resize-top', 'resize-bottom'
  const [tempStart, setTempStart] = useState(startMinute);
  const [tempDuration, setTempDuration] = useState(task.plannedTime || 60);
  
  const blockRef = useRef(null);
  const startYRef = useRef(0);
  const initialStartRef = useRef(0);
  const initialDurationRef = useRef(0);

  useEffect(() => {
    if (!isDragging) {
      setTempStart(startMinute);
      setTempDuration(task.plannedTime || 60);
    }
  }, [startMinute, task.plannedTime, isDragging]);

  const handleMouseDown = (e, type) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    startYRef.current = e.clientY;
    initialStartRef.current = tempStart;
    initialDurationRef.current = tempDuration;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const deltaY = e.clientY - startYRef.current;
    const deltaMinutes = pixelsToMinutes(deltaY, zoomFactor);
    
    if (dragType === 'move') {
      let newStart = snapToGrid(initialStartRef.current + deltaMinutes);
      newStart = Math.max(0, Math.min(newStart, 1440 - tempDuration));
      setTempStart(newStart);
    } else if (dragType === 'resize-bottom') {
      let newDuration = snapToGrid(initialDurationRef.current + deltaMinutes);
      newDuration = Math.max(15, Math.min(newDuration, 1440 - tempStart));
      setTempDuration(newDuration);
    } else if (dragType === 'resize-top') {
      let newStart = snapToGrid(initialStartRef.current + deltaMinutes);
      newStart = Math.max(0, Math.min(newStart, initialStartRef.current + initialDurationRef.current - 15));
      const newDuration = initialDurationRef.current + (initialStartRef.current - newStart);
      setTempStart(newStart);
      setTempDuration(newDuration);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    if (onUpdate) {
      onUpdate(task.id, tempStart, tempDuration);
    }
  };

  const top = calculatePosition(tempStart, zoomFactor);
  const height = calculateHeight(tempDuration, zoomFactor);
  const progress = tempDuration ? (timeSpent / tempDuration) * 100 : 0;

  return (
    <div
      ref={blockRef}
      className={cn(
        "absolute left-1 right-1 rounded-lg border-l-4 transition-shadow group overflow-hidden",
        task.status === 'completed' ? "bg-muted/50 border-muted-foreground/30 opacity-70" : "bg-card border-primary shadow-sm hover:shadow-md",
        isDragging ? "z-50 opacity-90 ring-2 ring-primary/50 cursor-grabbing" : "z-10 cursor-pointer hover:z-20"
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        borderLeftColor: projectColor,
      }}
      onClick={(e) => {
        if (!isDragging) onClick?.(task);
      }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
    >
      {/* Top Resize Handle */}
      <div 
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-primary/20 z-20"
        onMouseDown={(e) => handleMouseDown(e, 'resize-top')}
      />

      <div className="px-2 py-1 h-full flex flex-col justify-start overflow-hidden pointer-events-none">
        <div className="flex items-center justify-between gap-2">
          <div className={cn(
            "text-xs font-semibold truncate",
            task.status === 'completed' ? "line-through text-muted-foreground" : "text-foreground"
          )}>
            {task.name}
          </div>
          {isDragging && (
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1 rounded">
              {formatTimeHint(tempStart, tempDuration)}
            </span>
          )}
        </div>
        
        {height >= 40 && !isDragging && (
          <>
            {task.expand?.projectId?.name && (
              <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                {task.expand.projectId.name}
              </div>
            )}
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-auto pt-1">
              <Clock className="w-3 h-3" />
              {Math.floor(timeSpent/60)}h {timeSpent%60}m / {Math.floor(tempDuration/60)}h {tempDuration%60}m
            </div>
          </>
        )}
      </div>

      {/* Bottom Resize Handle */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-primary/20 z-20"
        onMouseDown={(e) => handleMouseDown(e, 'resize-bottom')}
      />
    </div>
  );
};

export default TaskBlock;
