
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, ListTodo } from 'lucide-react';
import { Input } from '@/components/ui/input.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { useToast } from '@/hooks/use-toast.js';
import LogWorkDialog from './LogWorkDialog.jsx';
import TaskCard from './TaskCard.jsx';

const TaskList = ({ projectId, onStartTimer }) => {
  const [tasks, setTasks] = useState([]);
  const [timeRecords, setTimeRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [logWorkTask, setLogWorkTask] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const inputRef = useRef(null);
  const editInputRef = useRef(null);
  const { toast } = useToast();

  const fetchTasksData = async () => {
    if (!projectId) {
      setTasks([]);
      return;
    }
    setLoading(true);
    try {
      const tasksData = await pb.collection('tasks').getFullList({
        filter: `projectId="${projectId}"`,
        sort: 'status,-created',
        expand: 'projectId',
        $autoCancel: false
      });
      setTasks(tasksData);

      if (tasksData.length > 0) {
        const filterStr = tasksData.map(t => `taskId="${t.id}"`).join(' || ');
        const records = await pb.collection('timeRecords').getFullList({
          filter: filterStr,
          $autoCancel: false
        });
        
        const timeMap = {};
        records.forEach(r => {
          timeMap[r.taskId] = (timeMap[r.taskId] || 0) + r.spentTime;
        });
        setTimeRecords(timeMap);
      } else {
        setTimeRecords({});
      }
    } catch (error) {
      toast({ title: 'Error fetching tasks', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, [projectId]);

  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTaskId]);

  const handleQuickAdd = async (e) => {
    if (e.key === 'Enter' && newTaskName.trim()) {
      try {
        await pb.collection('tasks').create({
          name: newTaskName.trim(),
          projectId: projectId,
          dueDate: new Date().toISOString(),
          status: 'todo',
          plannedTime: 60 // Default 1 hour
        }, { $autoCancel: false });
        setNewTaskName('');
        fetchTasksData();
        // Keep focus on input for quick consecutive adds
        setTimeout(() => inputRef.current?.focus(), 100);
      } catch (error) {
        toast({ title: 'Error creating task', description: error.message, variant: 'destructive' });
      }
    } else if (e.key === 'Escape') {
      setNewTaskName('');
      inputRef.current?.blur();
    }
  };

  const handleTaskClick = (task) => {
    setEditingTaskId(task.id);
    setEditingName(task.name);
  };

  const handleEditKeyDown = async (e, task) => {
    if (e.key === 'Enter') {
      // Save and create new task
      if (editingName.trim() && editingName !== task.name) {
        try {
          await pb.collection('tasks').update(task.id, { name: editingName.trim() }, { $autoCancel: false });
          await fetchTasksData();
        } catch (error) {
          toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
        }
      }
      setEditingTaskId(null);
      setNewTaskName('');
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (e.key === 'Escape') {
      setEditingTaskId(null);
      setEditingName('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Tab: Create subtask (not implemented in current schema - would need parentTaskId field)
      toast({ 
        title: 'Feature Coming Soon', 
        description: 'Subtask creation will be available in a future update.',
        variant: 'default'
      });
    }
  };

  const handleEditBlur = async (task) => {
    if (editingName.trim() && editingName !== task.name) {
      try {
        await pb.collection('tasks').update(task.id, { name: editingName.trim() }, { $autoCancel: false });
        await fetchTasksData();
      } catch (error) {
        toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
      }
    }
    setEditingTaskId(null);
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await pb.collection('tasks').delete(id, { $autoCancel: false });
      fetchTasksData();
    } catch (error) {
      toast({ title: 'Error deleting task', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      await pb.collection('tasks').update(task.id, { status: newStatus }, { $autoCancel: false });
      fetchTasksData();
    } catch (error) {
      toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
    }
  };

  if (!projectId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
        <ListTodo className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">Select a project</p>
        <p className="text-sm">Choose a project from the sidebar to view its tasks</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
      </div>

      <div className="mb-6">
        <Input
          ref={inputRef}
          placeholder="Quick add task... (Press Enter to save, Escape to cancel)"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onKeyDown={handleQuickAdd}
          className="bg-card border-border shadow-sm text-foreground placeholder:text-muted-foreground h-12 text-base"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No tasks yet</h3>
            <p className="text-muted-foreground mt-1">Type above and press Enter to create one</p>
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            {tasks.map(task => (
              editingTaskId === task.id ? (
                <div key={task.id} className="bg-card border-2 border-primary rounded-xl p-4 shadow-md">
                  <Input
                    ref={editInputRef}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, task)}
                    onBlur={() => handleEditBlur(task)}
                    className="bg-background border-border text-foreground text-base font-medium"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Enter to save, Escape to cancel
                  </p>
                </div>
              ) : (
                <div key={task.id} onClick={() => handleTaskClick(task)}>
                  <TaskCard 
                    task={task}
                    timeSpent={timeRecords[task.id] || 0}
                    onStartTimer={onStartTimer}
                    onLogWork={setLogWorkTask}
                    onDelete={handleDeleteTask}
                    onToggleStatus={handleToggleStatus}
                  />
                </div>
              )
            ))}
          </div>
        )}
      </div>

      <LogWorkDialog 
        open={!!logWorkTask} 
        onOpenChange={(open) => !open && setLogWorkTask(null)}
        task={logWorkTask}
        onWorkLogged={fetchTasksData}
      />
    </div>
  );
};

export default TaskList;
