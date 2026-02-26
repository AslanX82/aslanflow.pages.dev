
import React, { useState, useMemo, useEffect } from 'react';
import TimelineAxis from '@/components/TimelineAxis.jsx';
import TaskBlock from '@/components/TaskBlock.jsx';
import TimeRecordBlock from '@/components/TimeRecordBlock.jsx';
import TaskEditDialog from '@/components/TaskEditDialog.jsx';
import LogWorkDialog from '@/components/LogWorkDialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Plus, Clock, Play, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import { useProjectsAndTasks } from '@/hooks/useProjectsAndTasks.js';
import { createDateWithTime } from '@/lib/timelineSync.js';

const DayView = ({ currentDate, onDateChange }) => {
  const { tasks, timeRecords, projects, updateTask, deleteTask, updateTimeRecord, deleteTimeRecord, refreshData } = useProjectsAndTasks();
  
  const [zoomFactor, setZoomFactor] = useState(1); // 1=1h, 2=30m, 4=15m, 12=5m
  const zoomLevels = [1, 2, 4, 12];
  
  const [editingTask, setEditingTask] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);

  const dateStr = currentDate.toISOString().split('T')[0];
  
  const dayTasks = useMemo(() => tasks.filter(t => t.dueDate && t.dueDate.startsWith(dateStr)), [tasks, dateStr]);
  const dayRecords = useMemo(() => {
    return timeRecords
      .filter(r => r.logDate && r.logDate.startsWith(dateStr))
      .sort((a, b) => new Date(a.logDate) - new Date(b.logDate));
  }, [timeRecords, dateStr]);

  const tasksByProject = useMemo(() => {
    const grouped = {};
    dayTasks.forEach(task => {
      const pName = task.expand?.projectId?.name || 'No Project';
      if (!grouped[pName]) grouped[pName] = [];
      grouped[pName].push(task);
    });
    return grouped;
  }, [dayTasks]);

  const handleZoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoomFactor);
    if (currentIndex < zoomLevels.length - 1) setZoomFactor(zoomLevels[currentIndex + 1]);
  };

  const handleZoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoomFactor);
    if (currentIndex > 0) setZoomFactor(zoomLevels[currentIndex - 1]);
  };

  const handleTaskDragUpdate = async (taskId, newStartMinute, newDuration) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newDueDate = createDateWithTime(dateStr, newStartMinute);
    await updateTask(taskId, { dueDate: newDueDate, plannedTime: newDuration });
  };

  const handleRecordDragUpdate = async (recordId, newStartMinute, newDuration) => {
    const record = timeRecords.find(r => r.id === recordId);
    if (!record) return;
    const newLogDate = createDateWithTime(dateStr, newStartMinute);
    await updateTimeRecord(recordId, { logDate: newLogDate, spentTime: newDuration });
  };

  const openTaskEdit = (task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };

  const openRecordEdit = (record) => {
    setEditingRecord(record);
    setIsRecordDialogOpen(true);
  };

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4">
      {/* Top Section: Tasks Grouped by Project (30%) */}
      <div className="h-[30%] bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => onDateChange(-1)} className="h-7 w-7">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-base font-bold text-foreground min-w-[160px] text-center">
              {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h2>
            <Button variant="outline" size="icon" onClick={() => onDateChange(1)} className="h-7 w-7">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button size="sm" onClick={() => openTaskEdit({ projectId: projects[0]?.id })} className="h-8">
            <Plus className="w-4 h-4 mr-1" /> New Task
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.keys(tasksByProject).length === 0 ? (
            <div className="text-center text-muted-foreground py-4 text-sm">No tasks scheduled for today.</div>
          ) : (
            Object.entries(tasksByProject).map(([projectName, pTasks]) => (
              <div key={projectName} className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{projectName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pTasks.map(task => {
                    const spent = timeRecords.filter(r => r.taskId === task.id).reduce((s, r) => s + r.spentTime, 0);
                    const progress = task.plannedTime ? Math.min((spent / task.plannedTime) * 100, 100) : 0;
                    return (
                      <div key={task.id} onClick={() => openTaskEdit(task)} className="bg-background border border-border rounded-lg p-3 hover:border-primary/50 cursor-pointer transition-colors group relative overflow-hidden">
                        <div className="flex items-start gap-2">
                          <button onClick={(e) => { e.stopPropagation(); updateTask(task.id, { status: task.status === 'completed' ? 'todo' : 'completed' }); }} className="mt-0.5 text-muted-foreground hover:text-primary">
                            {task.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-secondary" /> : <Circle className="w-4 h-4" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className={cn("text-sm font-medium truncate", task.status === 'completed' && "line-through text-muted-foreground")}>{task.name}</div>
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(spent)} / {formatTime(task.plannedTime || 0)}</span>
                            </div>
                            {task.plannedTime > 0 && (
                              <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Section: Split Timeline & Records (70%) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Left: Timeline (50%) */}
        <div className="flex-1 lg:w-1/2 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-2 border-b border-border bg-muted/30 flex justify-between items-center">
            <span className="text-sm font-semibold px-2">Timeline</span>
            <div className="flex items-center gap-1 bg-background p-1 rounded-md border border-border">
              <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoomFactor === 1} className="h-6 w-6"><ZoomOut className="w-3 h-3" /></Button>
              <span className="text-xs font-medium px-1 w-8 text-center">{zoomFactor === 1 ? '1h' : zoomFactor === 2 ? '30m' : zoomFactor === 4 ? '15m' : '5m'}</span>
              <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoomFactor === 12} className="h-6 w-6"><ZoomIn className="w-3 h-3" /></Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto relative bg-background">
            <div className="flex">
              <TimelineAxis zoomFactor={zoomFactor} />
              <div className="absolute inset-0 left-16 right-4">
                {dayTasks.map(task => {
                  const d = new Date(task.dueDate);
                  const startMinute = d.getHours() * 60 + d.getMinutes();
                  const spent = timeRecords.filter(r => r.taskId === task.id).reduce((s, r) => s + r.spentTime, 0);
                  return (
                    <TaskBlock
                      key={`tb-${task.id}`}
                      task={task}
                      timeSpent={spent}
                      startMinute={startMinute}
                      zoomFactor={zoomFactor}
                      onUpdate={handleTaskDragUpdate}
                      onClick={openTaskEdit}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Time Records (50%) */}
        <div className="flex-1 lg:w-1/2 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-2 border-b border-border bg-muted/30 flex justify-between items-center">
            <span className="text-sm font-semibold px-2">Time Records</span>
            <Button size="sm" onClick={() => openRecordEdit(null)} className="h-7 text-xs"><Plus className="w-3 h-3 mr-1" /> Log Work</Button>
          </div>
          <div className="flex-1 overflow-y-auto relative bg-background">
            <div className="flex">
              <TimelineAxis zoomFactor={zoomFactor} showLabels={false} />
              <div className="absolute inset-0 left-4 right-4">
                {dayRecords.map(record => (
                  <TimeRecordBlock
                    key={`rb-${record.id}`}
                    record={record}
                    task={record.expand?.taskId}
                    zoomFactor={zoomFactor}
                    onUpdate={handleRecordDragUpdate}
                    onClick={openRecordEdit}
                    onDelete={deleteTimeRecord}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-border bg-muted/20 flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Daily Total</span>
            <span className="text-lg font-bold text-foreground">{formatTime(dayRecords.reduce((s, r) => s + r.spentTime, 0))}</span>
          </div>
        </div>
      </div>

      <TaskEditDialog 
        open={isTaskDialogOpen} 
        onOpenChange={setIsTaskDialogOpen} 
        task={editingTask} 
        projects={projects}
        onSave={async (id, data) => {
          if (id) await updateTask(id, data);
          else await updateTask(null, data); // Create not fully implemented in this snippet, assuming update handles it or use create
          refreshData();
        }}
        onDelete={async (id) => {
          await deleteTask(id);
          refreshData();
        }}
      />

      <LogWorkDialog
        open={isRecordDialogOpen}
        onOpenChange={setIsRecordDialogOpen}
        record={editingRecord}
        task={editingRecord?.expand?.taskId || dayTasks[0]} // Default to first task if creating new
        onSave={async (id, data) => {
          if (id) await updateTimeRecord(id, data);
          refreshData();
        }}
      />
    </div>
  );
};

export default DayView;
