
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { useToast } from '@/hooks/use-toast.js';
import { BarChart2, Clock, Folder } from 'lucide-react';

const TimeAnalyticsPage = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeRecords, setTimeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, tasksData, recordsData] = await Promise.all([
          pb.collection('projects').getFullList({ filter: 'type="project"', expand: 'tags', $autoCancel: false }),
          pb.collection('tasks').getFullList({ expand: 'projectId', $autoCancel: false }),
          pb.collection('timeRecords').getFullList({ expand: 'taskId', $autoCancel: false })
        ]);
        setProjects(projectsData);
        setTasks(tasksData);
        setTimeRecords(recordsData);
      } catch (error) {
        toast({ title: 'Error loading analytics', description: error.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate total time per project (including children and tasks)
  const calculateProjectTime = (projectId) => {
    let total = 0;
    
    // Find tasks for this project
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const taskIds = projectTasks.map(t => t.id);

    // Add time from these tasks
    const directRecords = timeRecords.filter(r => taskIds.includes(r.taskId));
    total += directRecords.reduce((sum, r) => sum + r.spentTime, 0);

    // Add children time
    const children = projects.filter(p => p.parentId === projectId);
    children.forEach(child => {
      total += calculateProjectTime(child.id);
    });

    return total;
  };

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const renderTree = (parentId = '', level = 0) => {
    const childProjects = projects.filter(p => (p.parentId || '') === parentId);
    const childTasks = parentId ? tasks.filter(t => t.projectId === parentId) : [];
    
    if (childProjects.length === 0 && childTasks.length === 0) return null;

    return (
      <div className="space-y-2">
        {childProjects.map(project => {
          const time = calculateProjectTime(project.id);
          if (time === 0) return null; // Hide empty projects

          return (
            <div key={project.id}>
              <div 
                className="flex items-center justify-between py-2 px-4 bg-[#2a2a2a] rounded-lg border border-gray-800"
                style={{ marginLeft: `${level * 24}px` }}
              >
                <div className="flex items-center gap-3">
                  <Folder className="w-4 h-4 text-[#5B7FFF]" />
                  <span className="text-white font-medium">{project.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
                  <Clock className="w-4 h-4" />
                  {formatTime(time)}
                </div>
              </div>
              {renderTree(project.id, level + 1)}
            </div>
          );
        })}
        
        {childTasks.map(task => {
          const taskRecords = timeRecords.filter(r => r.taskId === task.id);
          const time = taskRecords.reduce((sum, r) => sum + r.spentTime, 0);
          if (time === 0) return null;

          return (
            <div 
              key={task.id} 
              className="flex items-center justify-between py-2 px-4 bg-[#2a2a2a]/50 rounded-lg border border-gray-800/50" 
              style={{ marginLeft: `${level * 24}px` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-500 ml-1" />
                <span className="text-gray-300 font-medium">{task.name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
                <Clock className="w-4 h-4" />
                {formatTime(time)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const totalTimeAll = timeRecords.reduce((sum, r) => sum + r.spentTime, 0);

  return (
    <>
      <Helmet>
        <title>Analytics - Work Log</title>
      </Helmet>
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Header />
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-8">
            <BarChart2 className="w-8 h-8 text-[#5B7FFF]" />
            <h1 className="text-3xl font-bold text-white">Time Analytics</h1>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading analytics...</div>
          ) : (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                  <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Time Logged</h3>
                  <p className="text-4xl font-bold text-white">{formatTime(totalTimeAll)}</p>
                </div>
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                  <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Tasks</h3>
                  <p className="text-4xl font-bold text-white">{tasks.length}</p>
                </div>
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                  <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Time Entries</h3>
                  <p className="text-4xl font-bold text-white">{timeRecords.length}</p>
                </div>
              </div>

              {/* Tree View */}
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Time Distribution</h2>
                {totalTimeAll === 0 ? (
                  <div className="text-center py-10 text-gray-500">No time logged yet.</div>
                ) : (
                  <div className="space-y-2">
                    {renderTree('')}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default TimeAnalyticsPage;
