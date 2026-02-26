
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { useToast } from '@/hooks/use-toast.js';

const ProjectForm = ({ open, onOpenChange, onSubmit, projects, editProject = null }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editProject) {
      setName(editProject.name || '');
      setDescription(editProject.description || '');
      setParentId(editProject.parentId || '');
    } else {
      setName('');
      setDescription('');
      setParentId('');
    }
  }, [editProject, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Project name is required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        parentId: parentId || null
      });
      
      toast({
        title: 'Success',
        description: editProject ? 'Project updated successfully' : 'Project created successfully'
      });
      
      onOpenChange(false);
      setName('');
      setDescription('');
      setParentId('');
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

  // Filter out the current project and its descendants from parent options
  const availableParents = editProject 
    ? projects.filter(p => p.id !== editProject.id && p.parentId !== editProject.id)
    : projects;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#2a2a2a] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editProject ? 'Edit Project' : 'New Project'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-200">Project Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-200">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description (optional)"
              className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent" className="text-gray-200">Parent Project</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger className="bg-[#1a1a1a] border-gray-600 text-white">
                <SelectValue placeholder="None (root project)" />
              </SelectTrigger>
              <SelectContent className="bg-[#2a2a2a] border-gray-700 text-white">
                <SelectItem value="">None (root project)</SelectItem>
                {availableParents.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {loading ? 'Saving...' : editProject ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;
