
import React, { useState, useMemo } from 'react';
import TimelineAxis from '@/components/TimelineAxis.jsx';
import TaskBlock from '@/components/TaskBlock.jsx';
import TimeRecordBlock from '@/components/TimeRecordBlock.jsx';
import { Button } from '@/components/ui/button.jsx';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Clock } from 'lucide-react';
import { cn } from '@/lib/utils.js';

const WeekView = ({ currentDate, tasks, timeRecords, onDateChange }) => {
  const [zoomFactor, setZoomFactor] = useState(1);
  const zoomLevels = [1, 2, 4]; // Limit zoom in week view to avoid massive scrolling

  const handleZoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoomFactor);
    if (currentIndex < zoomLevels.length - 1) setZoomFactor(zoomLevels[currentIndex + 1]);
  };

  const handleZoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoomFactor);
    if (currentIndex > 0) setZoomFactor(zoomLevels[currentIndex - 1]);
  };

  const weekDates = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate]);

  const weekLabel = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  let weeklyTotal = 0;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col h-[calc(100vh-12rem)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onDateChange(-7)} className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-bold text-foreground min-w-[220px] text-center">
            {weekLabel}
          </h2>
          <Button variant="outline" size="icon" onClick={() => onDateChange(7)} className="h-8 w-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoomFactor === 1} className="h-7 w-7">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium px-2 text-muted-foreground">
              {zoomFactor === 1 ? '1h' : zoomFactor === 2 ? '30m' : '15m'}
            </span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoomFactor === 4} className="h-7 w-7">
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Header */}
      <div className="flex border-b border-border bg-background">
        <div className="w-16 flex-shrink-0 border-r border-border bg-muted/10"></div>
        {weekDates.map((date, i) => {
          const isToday = new Date().toDateString() === date.toDateString();
          return (
            <div key={i} className={cn(
              "flex-1 py-2 text-center border-r border-border last:border-r-0",
              isToday ? "bg-primary/5" : ""
            )}>
              <div className="text-xs font-medium text-muted-foreground uppercase">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={cn(
                "text-lg font-bold mt-0.5",
                isToday ? "text-primary" : "text-foreground"
              )}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrollable Timeline Grid */}
      <div className="flex-1 overflow-y-auto relative bg-background">
        <div className="flex min-w-[800px]">
          {/* Time Axis Labels */}
          <div className="w-16 flex-shrink-0 border-r border-border bg-muted/10 z-20 sticky left-0">
            <TimelineAxis zoomFactor={zoomFactor} showGrid={false} />
          </div>
          
          {/* Day Columns */}
          {weekDates.map((date, i) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(dateStr));
            const dayRecords = timeRecords.filter(r => r.logDate && r.logDate.startsWith(dateStr));
            
            const dayTotal = dayRecords.reduce((sum, r) => sum + r.spentTime, 0);
            weeklyTotal += dayTotal;

            return (
              <div key={i} className="flex-1 relative border-r border-border last:border-r-0 min-w-[100px]">
                <TimelineAxis zoomFactor={zoomFactor} showLabels={false} />
                
                <div className="absolute inset-0">
                  {/* Render Tasks */}
                  {dayTasks.map((task, index) => {
                    const startMinute = 540 + (index * 30); 
                    const timeSpent = timeRecords.filter(r => r.taskId === task.id).reduce((sum, r) => sum + r.spentTime, 0);
                    return (
                      <TaskBlock
                        key={`task-${task.id}`}
                        task={task}
                        timeSpent={timeSpent}
                        pixelsPerMinute={zoomFactor}
                        startMinute={startMinute}
                      />
                    );
                  })}

                  {/* Render Time Records */}
                  {dayRecords.map((record) => (
                    <TimeRecordBlock
                      key={`record-${record.id}`}
                      record={record}
                      task={record.expand?.taskId}
                      pixelsPerMinute={zoomFactor}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Totals */}
      <div className="flex border-t border-border bg-muted/20">
        <div className="w-16 flex-shrink-0 border-r border-border flex items-center justify-center">
          <Clock className="w-4 h-4 text-muted-foreground" />
        </div>
        {weekDates.map((date, i) => {
          const dateStr = date.toISOString().split('T')[0];
          const dayTotal = timeRecords
            .filter(r => r.logDate && r.logDate.startsWith(dateStr))
            .reduce((sum, r) => sum + r.spentTime, 0);
            
          return (
            <div key={i} className="flex-1 py-2 text-center border-r border-border last:border-r-0">
              <span className="text-sm font-bold text-secondary">
                {dayTotal > 0 ? formatTime(dayTotal) : '-'}
              </span>
            </div>
          );
        })}
      </div>
      <div className="p-2 bg-secondary/10 text-center border-t border-border">
        <span className="text-sm font-medium text-secondary-foreground/80">Weekly Total: </span>
        <span className="text-sm font-bold text-secondary">{formatTime(weeklyTotal)}</span>
      </div>
    </div>
  );
};

export default WeekView;
