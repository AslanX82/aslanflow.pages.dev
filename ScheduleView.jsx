
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import TaskCard from '@/components/TaskCard.jsx';
import TimeRecordingSystem from '@/components/TimeRecordingSystem.jsx';
import LogWorkDialog from '@/components/LogWorkDialog.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { useToast } from '@/hooks/use-toast.js';
import { CalendarDays, Sun, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils.js';

const ScheduleView = () => {
  const [tasks, setTasks] = useState([]);
  const [timeRecords, setTimeRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTimerTask, setActiveTimerTask] = useState(null);
  const [logWorkTask, setLogWorkTask] = useState(null);
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const { toast } = useToast();

  const fetchScheduleData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);

      const todayStr = today.toISOString().split('T')[0];
      const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

      const tasksData = await pb.collection('tasks').getFullList({
        filter: `dueDate >= "${todayStr}" && dueDate <= "${endOfWeekStr} 23:59:59"`,
        sort: 'dueDate,status',
        expand: 'projectId',
        $autoCancel: false
      });
      setTasks(tasksData);

      if (tasksData.length > 0) {
        const filterStr = tasksData.map(t => `taskId="${t.id}"`).join(' || ');
        const records = await pb.collection('timeRecords').getFullList({
          filter: filterStr,
          expand: 'taskId',
          $autoCancel: false
        });
        
        const timeMap = {};
        records.forEach(r => {
          timeMap[r.taskId] = (timeMap[r.taskId] || 0) + r.spentTime;
        });
        setTimeRecords(timeMap);
      }
    } catch (error) {
      toast({ title: 'Error fetching schedule', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await pb.collection('tasks').delete(id, { $autoCancel: false });
      fetchScheduleData();
    } catch (error) {
      toast({ title: 'Error deleting task', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      await pb.collection('tasks').update(task.id, { status: newStatus }, { $autoCancel: false });
      fetchScheduleData();
    } catch (error) {
      toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(todayStr));
  const weekTasks = tasks.filter(t => !t.dueDate || !t.dueDate.startsWith(todayStr));

  // Group today's tasks by project
  const todayByProject = todayTasks.reduce((acc, task) => {
    const projectName = task.expand?.projectId?.name || 'No Project';
    if (!acc[projectName]) acc[projectName] = [];
    acc[projectName].push(task);
    return acc;
  }, {});

  // Group week tasks by date
  const groupedWeekTasks = weekTasks.reduce((acc, task) => {
    const date = task.dueDate.split(' ')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const toggleProject = (projectName) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectName)) {
      newExpanded.delete(projectName);
    } else {
      newExpanded.add(projectName);
    }
    setExpandedProjects(newExpanded);
  };

  return (
    <>
      <Helmet>
        <title>Schedule - Work Log</title>
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 max-w-[1800px] w-full mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-8">
            <CalendarDays className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 h-[600px] bg-muted/50 rounded-xl animate-pulse" />
              <div className="lg:col-span-3 h-[600px] bg-muted/50 rounded-xl animate-pulse" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left: Today's Tasks (40%) */}
              <section className="lg:col-span-2">
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden sticky top-20">
                  <div className="p-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Sun className="w-5 h-5 text-accent" />
                      <h2 className="text-xl font-semibold text-foreground">Today's Tasks</h2>
                      <span className="text-sm text-muted-foreground ml-auto bg-muted px-2 py-0.5 rounded-full">
                        {todayTasks.length} tasks
                      </span>
                    </div>
                  </div>
                  
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-4">
                    {Object.keys(todayByProject).length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <Sun className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No tasks scheduled for today.</p>
                        <p className="text-sm mt-1">Enjoy your day!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(todayByProject).map(([projectName, projectTasks]) => {
                          const isExpanded = expandedProjects.has(projectName);
                          const totalTime = projectTasks.reduce((sum, t) => sum + (timeRecords[t.id] || 0), 0);
                          
                          return (
                            <div key={projectName} className="border border-border rounded-lg overflow-hidden">
                              <button
                                onClick={() => toggleProject(projectName)}
                                className="w-full p-3 flex items-center justify-between bg-muted/20 hover:bg-muted/40 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  <span className="font-medium text-foreground">{projectName}</span>
                                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                    {projectTasks.length}
                                  </span>
                                </div>
                                {totalTime > 0 && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(totalTime)}
                                  </span>
                                )}
                              </button>
                              
                              {isExpanded && (
                                <div className="p-3 space-y-2 bg-background">
                                  {projectTasks.map(task => (
                                    <TaskCard 
                                      key={task.id}
                                      task={task}
                                      timeSpent={timeRecords[task.id] || 0}
                                      onStartTimer={setActiveTimerTask}
                                      onLogWork={setLogWorkTask}
                                      onDelete={handleDeleteTask}
                                      onToggleStatus={handleToggleStatus}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Right: This Week (60%) */}
              <section className="lg:col-span-3">
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/30">
                    <h2 className="text-xl font-semibold text-foreground">This Week</h2>
                  </div>
                  
                  <div className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {Object.keys(groupedWeekTasks).length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No more tasks scheduled for this week.</p>
                      </div>
                    ) : (
                      Object.keys(groupedWeekTasks).sort().map(dateStr => {
                        const dateObj = new Date(dateStr);
                        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                        const dayTasks = groupedWeekTasks[dateStr];
                        const dayTotal = dayTasks.reduce((sum, t) => sum + (timeRecords[t.id] || 0), 0);
                        
                        return (
                          <div key={dateStr}>
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                {dayName}
                              </h3>
                              {dayTotal > 0 && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(dayTotal)} total
                                </span>
                              )}
                            </div>
                            <div className="space-y-3">
                              {dayTasks.map(task => (
                                <TaskCard 
                                  key={task.id}
                                  task={task}
                                  timeSpent={timeRecords[task.id] || 0}
                                  onStartTimer={setActiveTimerTask}
                                  onLogWork={setLogWorkTask}
                                  onDelete={handleDeleteTask}
                                  onToggleStatus={handleToggleStatus}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>

        <TimeRecordingSystem 
          activeTask={activeTimerTask} 
          onStop={() => {
            setActiveTimerTask(null);
            fetchScheduleData();
          }} 
        />
        
        <LogWorkDialog 
          open={!!logWorkTask} 
          onOpenChange={(open) => !open && setLogWorkTask(null)}
          task={logWorkTask}
          onWorkLogged={fetchScheduleData}
        />
      </div>
    </>
  );
};

export default ScheduleView;
