
import React, { useState, useRef, useEffect } from 'react';
import { Clock, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import { calculatePosition, calculateHeight, snapToGrid, pixelsToMinutes, formatTimeHint, extractStartMinute } from '@/lib/timelineSync.js';

const TimeRecordBlock = ({ record, task, onClick, onUpdate, onDelete, zoomFactor = 1 }) => {
  const initialStart = extractStartMinute(record.logDate);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null);
  const [tempStart, setTempStart] = useState(initialStart);
  const [tempDuration, setTempDuration] = useState(record.spentTime || 15);

  const startYRef = useRef(0);
  const initialStartRef = useRef(0);
  const initialDurationRef = useRef(0);

  useEffect(() => {
    if (!isDragging) {
      setTempStart(extractStartMinute(record.logDate));
      setTempDuration(record.spentTime || 15);
    }
  }, [record.logDate, record.spentTime, isDragging]);

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
      newDuration = Math.max(5, Math.min(newDuration, 1440 - tempStart));
      setTempDuration(newDuration);
    } else if (dragType === 'resize-top') {
      let newStart = snapToGrid(initialStartRef.current + deltaMinutes);
      newStart = Math.max(0, Math.min(newStart, initialStartRef.current + initialDurationRef.current - 5));
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
      onUpdate(record.id, tempStart, tempDuration);
    }
  };

  const top = calculatePosition(tempStart, zoomFactor);
  const height = calculateHeight(tempDuration, zoomFactor);

  return (
    <div
      className={cn(
        "absolute left-2 right-2 rounded-md bg-secondary/15 border border-secondary/40 transition-shadow group overflow-hidden",
        isDragging ? "z-50 opacity-90 ring-2 ring-secondary/50 cursor-grabbing" : "z-15 cursor-pointer hover:z-30 hover:shadow-md hover:bg-secondary/25"
      )}
      style={{ top: `${top}px`, height: `${height}px` }}
      onClick={(e) => { if (!isDragging) onClick?.(record); }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-secondary/30 z-20"
        onMouseDown={(e) => handleMouseDown(e, 'resize-top')}
      />

      <div className="px-2 py-0.5 h-full flex flex-col justify-start overflow-hidden pointer-events-none">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-foreground truncate leading-tight">
              {task?.name || 'Unknown Task'}
            </div>
            {isDragging && (
              <div className="text-[10px] font-bold text-secondary mt-0.5">
                {formatTimeHint(tempStart, tempDuration)}
              </div>
            )}
          </div>
          
          {!isDragging && height >= 30 && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 bg-background/80 backdrop-blur-sm rounded px-0.5 pointer-events-auto">
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(record.id); }}
                className="p-0.5 hover:bg-destructive/20 rounded text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div 
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-secondary/30 z-20"
        onMouseDown={(e) => handleMouseDown(e, 'resize-bottom')}
      />
    </div>
  );
};

export default TimeRecordBlock;
