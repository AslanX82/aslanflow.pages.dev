
import React from 'react';
import { Clock, Play, CheckCircle2, Circle, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.jsx';
import { cn } from '@/lib/utils.js';

const TaskCard = ({ task, timeSpent = 0, onStartTimer, onLogWork, onDelete, onToggleStatus }) => {
  const formatTime = (minutes) => {
    if (!minutes) return '0h';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h.toFixed(1)}h`;
  };

  const isCompleted = task.status === 'completed';
  const plannedTime = task.plannedTime || 0;
  const progress = plannedTime > 0 ? Math.min((timeSpent / plannedTime) * 100, 100) : 0;

  return (
    <div className={cn(
      "bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between group hover:border-primary/50 transition-all shadow-sm hover:shadow-md",
      isCompleted && "opacity-60 bg-muted/30"
    )}>
      <div className="flex items-start gap-4 mb-4 sm:mb-0 flex-1">
        <button 
          onClick={() => onToggleStatus(task)}
          className={cn(
            "mt-1 transition-colors flex-shrink-0",
            isCompleted ? "text-secondary hover:text-secondary/80" : "text-muted-foreground hover:text-primary"
          )}
        >
          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className={cn("text-base font-medium text-foreground truncate", isCompleted && "line-through text-muted-foreground")}>
            {task.name}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            {task.expand?.projectId?.name && (
              <span className="bg-muted px-2 py-0.5 rounded-md font-medium">
                {task.expand.projectId.name}
              </span>
            )}
            
            {/* Time Display with Progress */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {plannedTime > 0 ? (
                  <span>
                    <span className={cn("font-medium", timeSpent > plannedTime && "text-destructive")}>
                      {formatTime(timeSpent)}
                    </span>
                    <span className="text-muted-foreground"> / {formatTime(plannedTime)}</span>
                  </span>
                ) : (
                  <span className="font-medium">{formatTime(timeSpent)} logged</span>
                )}
              </span>
              
              {plannedTime > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all rounded-full",
                        progress >= 100 ? "bg-destructive" : progress >= 80 ? "bg-accent" : "bg-secondary"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    progress >= 100 ? "text-destructive" : progress >= 80 ? "text-accent" : "text-secondary"
                  )}>
                    {Math.round(progress)}%
                  </span>
                </div>
              )}
            </div>
            
            {task.dueDate && (
              <span className="text-xs">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto flex-shrink-0">
        <Button 
          variant="outline" 
          size="sm"
          className="bg-background border-border text-foreground hover:bg-muted"
          onClick={() => onLogWork(task)}
        >
          Log Work
        </Button>
        <Button 
          size="sm"
          className="bg-primary/10 text-primary hover:bg-primary/20 border-none"
          onClick={() => onStartTimer(task)}
          disabled={isCompleted}
        >
          <Play className="w-4 h-4 mr-1.5" /> Start
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
            <DropdownMenuItem onClick={() => onToggleStatus(task)} className="cursor-pointer">
              {isCompleted ? 'Mark as Todo' : 'Mark as Completed'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive hover:bg-destructive/10 cursor-pointer">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TaskCard;
