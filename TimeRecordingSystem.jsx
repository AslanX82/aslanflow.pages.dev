
import React, { useState, useEffect } from 'react';
import { Play, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { useToast } from '@/hooks/use-toast.js';
import pb from '@/lib/pocketbaseClient.js';

const TimeRecordingSystem = ({ activeTask, onStop }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, startTime]);

  // Reset if active task changes while not recording
  useEffect(() => {
    if (!isRecording) {
      setElapsedSeconds(0);
    }
  }, [activeTask, isRecording]);

  const handleStart = () => {
    if (!activeTask) {
      toast({
        title: 'No Task Selected',
        description: 'Please select a task to start recording time.',
        variant: 'destructive'
      });
      return;
    }
    setStartTime(Date.now());
    setIsRecording(true);
  };

  const handleStop = async () => {
    setIsRecording(false);
    const minutes = Math.ceil(elapsedSeconds / 60);
    
    if (minutes < 1) {
      toast({
        title: 'Time too short',
        description: 'Recorded time must be at least 1 minute to save.',
        variant: 'destructive'
      });
      setElapsedSeconds(0);
      return;
    }

    try {
      await pb.collection('timeRecords').create({
        taskId: activeTask.id,
        spentTime: minutes,
        logDate: new Date().toISOString().split('T')[0] + ' 12:00:00.000Z',
        notes: 'Auto-recorded session'
      }, { $autoCancel: false });

      toast({
        title: 'Time Saved',
        description: `Successfully logged ${minutes} minutes to ${activeTask.name}`
      });
      
      setElapsedSeconds(0);
      if (onStop) onStop();
    } catch (error) {
      toast({
        title: 'Error saving time',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!activeTask && !isRecording) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-[#2a2a2a] border border-gray-700 rounded-xl shadow-2xl p-4 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="flex flex-col">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Current Task</span>
        <span className="text-sm text-white font-semibold truncate max-w-[200px]">
          {activeTask?.name || 'Unknown Task'}
        </span>
      </div>
      
      <div className="h-8 w-px bg-gray-700 mx-2" />
      
      <div className="flex items-center gap-3 font-mono text-xl text-[#5B7FFF] w-[100px]">
        <Clock className="w-5 h-5" />
        {formatTime(elapsedSeconds)}
      </div>

      <div className="flex items-center gap-2 ml-2">
        {!isRecording ? (
          <Button 
            size="icon" 
            className="bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300 rounded-full"
            onClick={handleStart}
          >
            <Play className="w-5 h-5 ml-1" />
          </Button>
        ) : (
          <Button 
            size="icon" 
            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 rounded-full"
            onClick={handleStop}
          >
            <Square className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TimeRecordingSystem;
