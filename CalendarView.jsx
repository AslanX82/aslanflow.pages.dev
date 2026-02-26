
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header.jsx';
import MonthView from './MonthView.jsx';
import WeekView from './WeekView.jsx';
import DayView from './DayView.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { useToast } from '@/hooks/use-toast.js';
import { Calendar as CalendarIcon, LayoutGrid, List, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { cn } from '@/lib/utils.js';

const CalendarView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = searchParams.get('view') || 'month';
  const dateParam = searchParams.get('date');
  
  const [currentDate, setCurrentDate] = useState(dateParam ? new Date(dateParam) : new Date());
  const [tasks, setTasks] = useState([]);
  const [timeRecords, setTimeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const setViewMode = (mode) => {
    setSearchParams({ view: mode, date: currentDate.toISOString().split('T')[0] });
  };

  const handleDateChange = (daysToAdd) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + daysToAdd);
    setCurrentDate(newDate);
    setSearchParams({ view: viewMode, date: newDate.toISOString().split('T')[0] });
  };

  const handleDateClick = (date) => {
    setCurrentDate(date);
    setSearchParams({ view: 'day', date: date.toISOString().split('T')[0] });
  };

  useEffect(() => {
    if (dateParam) {
      const parsedDate = new Date(dateParam);
      if (!isNaN(parsedDate.getTime()) && parsedDate.getTime() !== currentDate.getTime()) {
        setCurrentDate(parsedDate);
      }
    }
  }, [dateParam]);

  useEffect(() => {
    fetchData();
  }, [currentDate, viewMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Determine fetch range based on view to optimize
      let startDate = new Date(currentDate);
      let endDate = new Date(currentDate);

      if (viewMode === 'month') {
        startDate.setDate(1);
        startDate.setMonth(startDate.getMonth() - 1); // Fetch previous month too for padding
        endDate.setMonth(endDate.getMonth() + 2); // Fetch next month too
      } else if (viewMode === 'week') {
        startDate.setDate(startDate.getDate() - startDate.getDay() - 7);
        endDate.setDate(endDate.getDate() + 14);
      } else {
        startDate.setDate(startDate.getDate() - 1);
        endDate.setDate(endDate.getDate() + 2);
      }

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const [tasksData, recordsData] = await Promise.all([
        pb.collection('tasks').getFullList({
          filter: `dueDate >= "${startStr}" && dueDate < "${endStr}"`,
          expand: 'projectId',
          $autoCancel: false
        }),
        pb.collection('timeRecords').getFullList({
          filter: `logDate >= "${startStr}" && logDate < "${endStr}"`,
          expand: 'taskId',
          $autoCancel: false
        })
      ]);

      setTasks(tasksData);
      setTimeRecords(recordsData);
    } catch (error) {
      toast({ title: 'Error loading calendar data', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (record) => {
    if (!window.confirm('Delete this time record?')) return;
    try {
      await pb.collection('timeRecords').delete(record.id, { $autoCancel: false });
      fetchData();
      toast({ title: 'Record deleted' });
    } catch (error) {
      toast({ title: 'Error deleting record', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddRecord = () => {
    toast({ title: 'Feature Coming Soon', description: 'Add record dialog will be implemented here.' });
  };

  const handleEditRecord = (record) => {
    toast({ title: 'Feature Coming Soon', description: 'Edit record dialog will be implemented here.' });
  };

  return (
    <>
      <Helmet>
        <title>Calendar - Work Log</title>
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 max-w-[1800px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
            </div>
            
            <div className="flex bg-muted p-1 rounded-lg shadow-sm">
              <Button 
                variant={viewMode === 'month' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('month')}
                className={cn("h-9 px-4", viewMode === 'month' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
              >
                <LayoutGrid className="w-4 h-4 mr-2" /> Month
              </Button>
              <Button 
                variant={viewMode === 'week' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('week')}
                className={cn("h-9 px-4", viewMode === 'week' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
              >
                <CalendarDays className="w-4 h-4 mr-2" /> Week
              </Button>
              <Button 
                variant={viewMode === 'day' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('day')}
                className={cn("h-9 px-4", viewMode === 'day' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
              >
                <List className="w-4 h-4 mr-2" /> Day
              </Button>
            </div>
          </div>

          <div className="flex-1 relative">
            {loading && tasks.length === 0 ? (
              <div className="absolute inset-0 bg-muted/50 rounded-xl animate-pulse" />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {viewMode === 'month' && (
                    <MonthView 
                      currentDate={currentDate} 
                      tasks={tasks} 
                      timeRecords={timeRecords} 
                      onDateClick={handleDateClick}
                    />
                  )}
                  {viewMode === 'week' && (
                    <WeekView 
                      currentDate={currentDate} 
                      tasks={tasks} 
                      timeRecords={timeRecords} 
                      onDateChange={handleDateChange}
                    />
                  )}
                  {viewMode === 'day' && (
                    <DayView 
                      currentDate={currentDate} 
                      tasks={tasks} 
                      timeRecords={timeRecords} 
                      onDateChange={handleDateChange}
                      onAddRecord={handleAddRecord}
                      onEditRecord={handleEditRecord}
                      onDeleteRecord={handleDeleteRecord}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default CalendarView;
