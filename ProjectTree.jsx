
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Plus, Folder, FolderOpen, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import pb from '@/lib/pocketbaseClient.js';
import { useToast } from '@/hooks/use-toast.js';
import { cn } from '@/lib/utils.js';

const ProjectTree = ({ selectedProjectId, onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const inputRef = useRef(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [projectsData, tasksData] = await Promise.all([
        pb.collection('projects').getFullList({
          filter: 'type="project"',
          sort: 'name',
          $autoCancel: false
        }),
        pb.collection('tasks').getFullList({
          $autoCancel: false
        })
      ]);
      setProjects(projectsData);
      setTasks(tasksData);
      
      if (expandedNodes.size === 0) {
        const topLevel = projectsData.filter(p => !p.parentId).map(p => p.id);
        setExpandedNodes(new Set(topLevel));
      }
    } catch (error) {
      toast({ title: 'Error fetching data', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const handleAddProject = async (parentId = '') => {
    try {
      const record = await pb.collection('projects').create({
        name: 'New Project',
        type: 'project',
        parentId: parentId
      }, { $autoCancel: false });
      
      await fetchData();
      if (parentId) {
        setExpandedNodes(prev => new Set(prev).add(parentId));
      }
      setEditingId(record.id);
      setEditName('New Project');
    } catch (error) {
      toast({ title: 'Error creating project', description: error.message, variant: 'destructive' });
    }
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await pb.collection('projects').update(id, { name: editName }, { $autoCancel: false });
      setProjects(projects.map(p => p.id === id ? { ...p, name: editName } : p));
    } catch (error) {
      toast({ title: 'Error updating project', description: error.message, variant: 'destructive' });
    } finally {
      setEditingId(null);
    }
  };

  const handleKeyDown = (e, id, parentId) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab: Add sibling to parent (go up a level)
        const parent = projects.find(p => p.id === parentId);
        handleAddProject(parent ? parent.parentId : '');
      } else {
        // Tab: Add child
        handleAddProject(id);
      }
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its contents?')) return;
    try {
      await pb.collection('projects').delete(id, { $autoCancel: false });
      if (selectedProjectId === id) onSelectProject(null);
      fetchData();
    } catch (error) {
      toast({ title: 'Error deleting project', description: error.message, variant: 'destructive' });
    }
  };

  const getTaskCount = (projectId) => {
    return tasks.filter(t => t.projectId === projectId).length;
  };

  const renderTree = (parentId = '', level = 0) => {
    const children = projects.filter(p => (p.parentId || '') === parentId);
    if (children.length === 0) return null;

    return (
      <div className="space-y-0.5">
        {children.map(project => {
          const isExpanded = expandedNodes.has(project.id);
          const isSelected = selectedProjectId === project.id;
          const hasChildren = projects.some(p => p.parentId === project.id);
          const taskCount = getTaskCount(project.id);
          const isEditing = editingId === project.id;

          return (
            <div key={project.id}>
              <div 
                className={cn(
                  "group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-all",
                  isSelected ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted",
                  level > 0 && "ml-4 border-l border-border pl-2"
                )}
                onClick={() => !isEditing && onSelectProject(project.id)}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  <button 
                    onClick={(e) => toggleExpand(project.id, e)}
                    className={cn("p-0.5 rounded hover:bg-muted-foreground/20 text-muted-foreground", !hasChildren && "invisible")}
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  
                  {isExpanded ? <FolderOpen className="w-4 h-4 flex-shrink-0 text-primary/70" /> : <Folder className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
                  
                  {isEditing ? (
                    <Input
                      ref={inputRef}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSaveEdit(project.id)}
                      onKeyDown={(e) => handleKeyDown(e, project.id, project.parentId)}
                      className="h-6 py-0 px-1 text-sm bg-background border-primary"
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span 
                      className="text-sm truncate flex-1"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditName(project.name);
                        setEditingId(project.id);
                      }}
                    >
                      {project.name}
                    </span>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1">
                    {taskCount > 0 && (
                      <span className="text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full group-hover:hidden">
                        {taskCount}
                      </span>
                    )}
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); handleAddProject(project.id); }}>
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); setEditName(project.name); setEditingId(project.id); }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={(e) => handleDelete(project.id, e)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {isExpanded && hasChildren && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {renderTree(project.id, level + 1)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-card border-r border-border h-full flex flex-col shadow-sm">
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Projects</h2>
        <Button size="icon" variant="ghost" onClick={() => handleAddProject('')} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="text-center py-4 text-muted-foreground text-sm">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
            <Folder className="w-8 h-8 opacity-20" />
            <span>No projects yet.<br/>Click + to create one.</span>
          </div>
        ) : (
          renderTree('')
        )}
      </div>
    </div>
  );
};

export default ProjectTree;
