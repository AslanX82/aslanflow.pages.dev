
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import ProjectTree from '@/components/ProjectTree.jsx';
import TaskList from '@/components/TaskList.jsx';
import TimeRecordingSystem from '@/components/TimeRecordingSystem.jsx';
import { Button } from '@/components/ui/button.jsx';
import { FolderTree, X } from 'lucide-react';
import { cn } from '@/lib/utils.js';

const WorkLogApp = () => {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeTimerTask, setActiveTimerTask] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Dashboard - Work Log</title>
      </Helmet>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <Header />
        
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden p-4 border-b border-border bg-card flex items-center justify-between">
          <span className="font-medium text-foreground">Projects & Tasks</span>
          <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)}>
            <FolderTree className="w-4 h-4 mr-2" /> Projects
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          {/* Sidebar Overlay for Mobile */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside className={cn(
            "absolute md:relative z-50 w-80 h-full flex-shrink-0 border-r border-border bg-card transition-transform duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}>
            <div className="md:hidden absolute top-2 right-2 z-10">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <ProjectTree 
              selectedProjectId={selectedProjectId} 
              onSelectProject={(id) => {
                setSelectedProjectId(id);
                setSidebarOpen(false); // Close on mobile after selection
              }} 
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-background">
            <TaskList 
              projectId={selectedProjectId} 
              onStartTimer={setActiveTimerTask}
            />
          </main>
        </div>

        {/* Floating Timer Widget */}
        <TimeRecordingSystem 
          activeTask={activeTimerTask} 
          onStop={() => setActiveTimerTask(null)} 
        />
      </div>
    </>
  );
};

export default WorkLogApp;
