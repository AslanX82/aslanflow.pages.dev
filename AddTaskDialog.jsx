
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { useToast } from '@/hooks/use-toast.js';

const AddTaskDialog = ({ open, onOpenChange, onSubmit, projects, selectedDate }) => {
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [plannedTime, setPlannedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setName('');
      setProjectId('');
      setDescription('');
      setPlannedTime('');
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Task name is required',
        variant: 'destructive'
      });
      return;
    }

    if (!projectId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a project',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        projectId,
        description: description.trim(),
        dueDate: selectedDate,
        plannedTime: plannedTime ? parseFloat(plannedTime) : null,
        actualTime: null,
        status: 'todo'
      });
      
      toast({
        title: 'Success',
        description: 'Task created successfully'
      });
      
      onOpenChange(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#2a2a2a] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Task for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-name" className="text-gray-200">Task Name *</Label>
            <Input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter task name"
              className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project" className="text-gray-200">Project *</Label>
            <Select value={projectId} onValueChange={setProjectId} required>
              <SelectTrigger className="bg-[#1a1a1a] border-gray-600 text-white">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent className="bg-[#2a2a2a] border-gray-700 text-white">
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description" className="text-gray-200">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)"
              className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500 min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="planned-time" className="text-gray-200">Planned Time (minutes)</Label>
            <Input
              id="planned-time"
              type="number"
              min="0"
              step="15"
              value={plannedTime}
              onChange={(e) => setPlannedTime(e.target.value)}
              placeholder="e.g., 60"
              className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#5B7FFF] hover:bg-[#4a6eee] text-white"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
