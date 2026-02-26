
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { motion } from 'framer-motion';
import AddTaskDialog from '@/components/AddTaskDialog.jsx';

const Calendar = ({ selectedDate, onSelectDate, datesWithTasks, projects, onCreateTask }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [showAddTask, setShowAddTask] = useState(false);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return formatDate(date) === selectedDate;
  };

  const hasTask = (date) => {
    return datesWithTasks.includes(formatDate(date));
  };

  const handleDateClick = (date) => {
    onSelectDate(formatDate(date));
  };

  const days = getDaysInMonth(currentMonth);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-[#2a2a2a] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={previousMonth}
            size="sm"
            variant="outline"
            className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            onClick={nextMonth}
            size="sm"
            variant="outline"
            className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowAddTask(true)}
            size="sm"
            className="bg-[#5B7FFF] hover:bg-[#4a6eee] text-white ml-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">
            {day}
          </div>
        ))}
        
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const selected = isSelected(date);
          const today = isToday(date);
          const hasTasks = hasTask(date);

          return (
            <motion.button
              key={formatDate(date)}
              onClick={() => handleDateClick(date)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-colors relative ${
                selected
                  ? 'bg-[#5B7FFF] text-white'
                  : today
                  ? 'bg-gray-700 text-white'
                  : 'bg-[#1a1a1a] text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span>{date.getDate()}</span>
              {hasTasks && !selected && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#5B7FFF]" />
              )}
              {hasTasks && selected && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />
              )}
            </motion.button>
          );
        })}
      </div>

      <AddTaskDialog
        open={showAddTask}
        onOpenChange={setShowAddTask}
        onSubmit={onCreateTask}
        projects={projects}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Calendar;
