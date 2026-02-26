
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { useToast } from '@/hooks/use-toast.js';

const TaskEditDialog = ({ open, onOpenChange, onSave, onDelete, projects, task }) => {
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [plannedTime, setPlannedTime] = useState('');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (task && open) {
      setName(task.name || '');
      setProjectId(task.projectId || '');
      setDescription(task.description || '');
      setPlannedTime(task.plannedTime ? task.plannedTime.toString() : '');
      setStatus(task.status || 'todo');
      setDueDate(task.dueDate ? task.dueDate.split(' ')[0] : new Date().toISOString().split('T')[0]);
    }
  }, [task, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !projectId) {
      toast({ title: 'Validation Error', description: 'Name and Project are required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await onSave(task.id, {
        name: name.trim(),
        projectId,
        description: description.trim(),
        plannedTime: plannedTime ? parseFloat(plannedTime) : null,
        status,
        dueDate: dueDate ? `${dueDate} 12:00:00.000Z` : task.dueDate
      });
      onOpenChange(false);
    } catch (err) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setLoading(true);
      try {
        await onDelete(task.id);
        onOpenChange(false);
      } catch (err) {
        // Error handled in hook
      } finally {
        setLoading(false);
      }
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-task-name">Task Name *</Label>
            <Input id="edit-task-name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-background" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project">Project *</Label>
              <Select value={projectId} onValueChange={setProjectId} required>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Planned Date</Label>
              <Input id="edit-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-background" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-planned-time">Planned Time (mins)</Label>
              <Input id="edit-planned-time" type="number" min="0" step="5" value={plannedTime} onChange={(e) => setPlannedTime(e.target.value)} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-task-description">Description</Label>
            <Textarea id="edit-task-description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-background min-h-[80px]" />
          </div>

          <DialogFooter className="gap-2 pt-4 flex justify-between sm:justify-between">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>Delete</Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">Save Changes</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;
