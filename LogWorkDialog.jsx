
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { useToast } from '@/hooks/use-toast.js';
import pb from '@/lib/pocketbaseClient.js';
import { cn } from '@/lib/utils.js';

const PRESET_BLOCKERS = ['低估难度', '技术卡点', '完美主义', '情绪内耗', '外部打断'];
const PRESET_NATURE = ['Creation', 'Optimization', 'Review', 'Admin', 'Research'];

const LogWorkDialog = ({ open, onOpenChange, task, record, onSave, timerDuration = 0 }) => {
  const [activeTab, setActiveTab] = useState('log');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form State
  const [spentTime, setSpentTime] = useState('');
  const [logDate, setLogDate] = useState('');
  const [logTime, setLogTime] = useState('');
  
  const [sessionGoal, setSessionGoal] = useState('');
  const [tangibleOutput, setTangibleOutput] = useState('');
  const [currentProblems, setCurrentProblems] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  
  const [satisfaction, setSatisfaction] = useState(3);
  const [focusLevel, setFocusLevel] = useState(3);
  const [deviationBlockers, setDeviationBlockers] = useState('');
  const [natureOfWork, setNatureOfWork] = useState('');
  const [otherRemarks, setOtherRemarks] = useState('');

  useEffect(() => {
    if (open) {
      if (record) {
        // Edit mode
        setSpentTime(record.spentTime?.toString() || '');
        const d = new Date(record.logDate);
        setLogDate(d.toISOString().split('T')[0]);
        setLogTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
        
        setSessionGoal(record.sessionGoal || '');
        setTangibleOutput(record.tangibleOutput || '');
        setCurrentProblems(record.currentProblems || '');
        setNextSteps(record.nextSteps || '');
        setSatisfaction(record.satisfaction || 3);
        setFocusLevel(record.focusLevel || 3);
        setDeviationBlockers(record.deviationBlockers || '');
        setNatureOfWork(record.natureOfWork || '');
        setOtherRemarks(record.otherRemarks || record.notes || '');
      } else {
        // Create mode
        const totalMins = timerDuration > 0 ? Math.ceil(timerDuration / 60) : 60;
        setSpentTime(totalMins.toString());
        const now = new Date();
        setLogDate(now.toISOString().split('T')[0]);
        setLogTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
        
        setSessionGoal(''); setTangibleOutput(''); setCurrentProblems(''); setNextSteps('');
        setSatisfaction(3); setFocusLevel(3); setDeviationBlockers(''); setNatureOfWork(''); setOtherRemarks('');
      }
      setActiveTab('log');
    }
  }, [open, record, timerDuration]);

  const handleTagToggle = (currentStr, setStr, tag) => {
    const tags = currentStr.split(',').map(t => t.trim()).filter(Boolean);
    if (tags.includes(tag)) {
      setStr(tags.filter(t => t !== tag).join(', '));
    } else {
      setStr([...tags, tag].join(', '));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mins = parseInt(spentTime || 0);
    if (mins <= 0) {
      toast({ title: 'Invalid Time', description: 'Duration must be > 0', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const dateTimeStr = `${logDate} ${logTime}:00.000Z`;
      const data = {
        taskId: task?.id || record?.taskId,
        spentTime: mins,
        logDate: dateTimeStr,
        sessionGoal, tangibleOutput, currentProblems, nextSteps,
        satisfaction, focusLevel, deviationBlockers, natureOfWork,
        otherRemarks, notes: otherRemarks // fallback for old schema
      };

      if (record) {
        await onSave(record.id, data);
      } else {
        await pb.collection('timeRecords').create(data, { $autoCancel: false });
        toast({ title: 'Success', description: 'Work logged successfully' });
        if (onSave) onSave(); // trigger refresh
      }
      onOpenChange(false);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const renderEmojiSelector = (value, setValue) => (
    <div className="flex gap-2">
      {['😫', '🙁', '😐', '🙂', '🤩'].map((emoji, i) => (
        <button
          key={i} type="button"
          onClick={() => setValue(i + 1)}
          className={cn("text-2xl p-2 rounded-full transition-all hover:bg-muted", value === i + 1 ? "bg-primary/20 ring-2 ring-primary scale-110" : "opacity-50 grayscale")}
        >
          {emoji}
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <div className="p-6 pb-2 border-b border-border">
          <DialogTitle className="text-xl font-bold">{record ? 'Edit Time Record' : 'Log Work'}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {task?.name || record?.expand?.taskId?.name} 
            <span className="mx-2">•</span> 
            {task?.expand?.projectId?.name || record?.expand?.taskId?.expand?.projectId?.name}
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="log">Log Details</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <Tabs value={activeTab} className="h-full">
            <TabsContent value="log" className="m-0 space-y-6">
              <form id="log-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Time & Date */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="space-y-2">
                    <Label>Duration (mins)</Label>
                    <Input type="number" min="1" value={spentTime} onChange={e => setSpentTime(e.target.value)} required className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} required className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="time" value={logTime} onChange={e => setLogTime(e.target.value)} required className="bg-background" />
                  </div>
                </div>

                {/* Core Questions */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-primary uppercase tracking-wider">Session Details</h3>
                  <div className="space-y-2">
                    <Label>What did you aim to achieve? (Session Goal)</Label>
                    <Textarea value={sessionGoal} onChange={e => setSessionGoal(e.target.value)} className="bg-background resize-none h-20" />
                  </div>
                  <div className="space-y-2">
                    <Label>What concrete thing did you produce? (Tangible Output)</Label>
                    <Textarea value={tangibleOutput} onChange={e => setTangibleOutput(e.target.value)} className="bg-background resize-none h-20" />
                  </div>
                  <div className="space-y-2">
                    <Label>What blockers or issues did you encounter? (Current Problems)</Label>
                    <Textarea value={currentProblems} onChange={e => setCurrentProblems(e.target.value)} className="bg-background resize-none h-20" />
                  </div>
                  <div className="space-y-2">
                    <Label>What do you plan to do next? (Next Steps)</Label>
                    <Textarea value={nextSteps} onChange={e => setNextSteps(e.target.value)} className="bg-background resize-none h-20" />
                  </div>
                </div>

                {/* Review & Reflection */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-sm text-primary uppercase tracking-wider">Review & Reflection</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Satisfaction</Label>
                      {renderEmojiSelector(satisfaction, setSatisfaction)}
                    </div>
                    <div className="space-y-2">
                      <Label>Focus Level</Label>
                      {renderEmojiSelector(focusLevel, setFocusLevel)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Deviation / Blockers</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {PRESET_BLOCKERS.map(tag => (
                        <span key={tag} onClick={() => handleTagToggle(deviationBlockers, setDeviationBlockers, tag)}
                          className={cn("text-xs px-2 py-1 rounded-full cursor-pointer border transition-colors", deviationBlockers.includes(tag) ? "bg-destructive/20 border-destructive text-destructive" : "bg-muted border-border hover:bg-muted/80")}
                        >{tag}</span>
                      ))}
                    </div>
                    <Input value={deviationBlockers} onChange={e => setDeviationBlockers(e.target.value)} className="bg-background" placeholder="Custom blockers..." />
                  </div>

                  <div className="space-y-2">
                    <Label>Nature of Work</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {PRESET_NATURE.map(tag => (
                        <span key={tag} onClick={() => handleTagToggle(natureOfWork, setNatureOfWork, tag)}
                          className={cn("text-xs px-2 py-1 rounded-full cursor-pointer border transition-colors", natureOfWork.includes(tag) ? "bg-secondary/20 border-secondary text-secondary" : "bg-muted border-border hover:bg-muted/80")}
                        >{tag}</span>
                      ))}
                    </div>
                    <Input value={natureOfWork} onChange={e => setNatureOfWork(e.target.value)} className="bg-background" placeholder="Custom nature..." />
                  </div>

                  <div className="space-y-2">
                    <Label>Other Remarks</Label>
                    <Textarea value={otherRemarks} onChange={e => setOtherRemarks(e.target.value)} className="bg-background resize-none h-20" />
                  </div>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="history" className="m-0">
              <div className="text-center py-12 text-muted-foreground">
                <p>History view coming soon.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="log-form" disabled={loading} className="bg-primary text-primary-foreground">
            {loading ? 'Saving...' : 'Save Log'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogWorkDialog;
