
import React from 'react';
import { cn } from '@/lib/utils.js';
import { Clock, CheckCircle2 } from 'lucide-react';

const MonthView = ({ currentDate, tasks, timeRecords, onDateClick }) => {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Padding for previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -firstDay.getDay() + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Padding for next month
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {weekDays.map(day => (
          <div key={day} className="py-3 text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((dayObj, i) => {
          const dateStr = dayObj.date.toISOString().split('T')[0];
          const dayTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(dateStr));
          const dayRecords = timeRecords.filter(r => r.logDate && r.logDate.startsWith(dateStr));
          
          const totalSpent = dayRecords.reduce((sum, r) => sum + r.spentTime, 0);
          const completedTasks = dayTasks.filter(t => t.status === 'completed').length;
          
          const isToday = new Date().toDateString() === dayObj.date.toDateString();

          return (
            <div 
              key={`${dateStr}-${i}`} 
              onClick={() => onDateClick(dayObj.date)}
              className={cn(
                "min-h-[120px] p-2 border-b border-r border-border/50 transition-colors cursor-pointer hover:bg-muted/30 flex flex-col",
                !dayObj.isCurrentMonth && "bg-muted/10 opacity-50",
                isToday && "bg-primary/5"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={cn(
                  "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                  isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}>
                  {dayObj.date.getDate()}
                </div>
                {totalSpent > 0 && (
                  <div className="text-xs font-medium text-secondary flex items-center gap-1 bg-secondary/10 px-1.5 py-0.5 rounded">
                    <Clock className="w-3 h-3" />
                    {formatTime(totalSpent)}
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-1 overflow-hidden">
                {dayTasks.slice(0, 3).map(task => (
                  <div key={task.id} className={cn(
                    "text-xs px-1.5 py-1 rounded border truncate flex items-center gap-1",
                    task.status === 'completed' ? "bg-muted/50 text-muted-foreground border-transparent" : "bg-background text-foreground border-border shadow-sm"
                  )}>
                    {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 flex-shrink-0" />}
                    <span className={cn("truncate", task.status === 'completed' && "line-through")}>{task.name}</span>
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-muted-foreground font-medium pl-1">
                    +{dayTasks.length - 3} more tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
