
import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useToast } from '@/hooks/use-toast.js';

export const useProjectsAndTasks = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeRecords, setTimeRecords] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      const records = await pb.collection('projects').getFullList({
        filter: 'type="project"',
        sort: 'created',
        expand: 'tags',
        $autoCancel: false
      });
      setProjects(records);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      const records = await pb.collection('tasks').getFullList({
        sort: '-dueDate',
        expand: 'projectId',
        $autoCancel: false
      });
      setTasks(records);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTimeRecords = async () => {
    try {
      const records = await pb.collection('timeRecords').getFullList({
        sort: '-logDate',
        expand: 'taskId',
        $autoCancel: false
      });
      setTimeRecords(records);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProjects(), fetchTasks(), fetchTimeRecords()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const updateTask = async (id, taskData) => {
    try {
      const record = await pb.collection('tasks').update(id, taskData, { $autoCancel: false });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...record } : t));
      return record;
    } catch (err) {
      toast({ title: 'Error updating task', description: err.message, variant: 'destructive' });
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await pb.collection('tasks').delete(id, { $autoCancel: false });
      setTasks(prev => prev.filter(t => t.id !== id));
      toast({ title: 'Task deleted successfully' });
    } catch (err) {
      toast({ title: 'Error deleting task', description: err.message, variant: 'destructive' });
      throw err;
    }
  };

  const updateTimeRecord = async (id, recordData) => {
    try {
      const record = await pb.collection('timeRecords').update(id, recordData, { $autoCancel: false });
      setTimeRecords(prev => prev.map(r => r.id === id ? { ...r, ...record } : r));
      return record;
    } catch (err) {
      toast({ title: 'Error updating record', description: err.message, variant: 'destructive' });
      throw err;
    }
  };

  const deleteTimeRecord = async (id) => {
    try {
      await pb.collection('timeRecords').delete(id, { $autoCancel: false });
      setTimeRecords(prev => prev.filter(r => r.id !== id));
      toast({ title: 'Record deleted successfully' });
    } catch (err) {
      toast({ title: 'Error deleting record', description: err.message, variant: 'destructive' });
      throw err;
    }
  };

  return {
    projects,
    tasks,
    timeRecords,
    selectedProject,
    setSelectedProject,
    selectedDate,
    setSelectedDate,
    loading,
    error,
    updateTask,
    deleteTask,
    updateTimeRecord,
    deleteTimeRecord,
    refreshData: async () => {
      await Promise.all([fetchProjects(), fetchTasks(), fetchTimeRecords()]);
    }
  };
};
