
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlowState } from '@/context/FlowStateContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormLabel } from '@/components/ui/form';
import { Brain, Lightbulb, CalendarIcon, Flag } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { PriorityLevel } from '@/types';

const TaskSetup: React.FC = () => {
  const { createTask } = useFlowState();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createTask(title, description, priority, dueDate);
      toast({
        title: "Task Created",
        description: "Your task has been created successfully.",
      });
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="relative flex items-center justify-center w-24 h-24 mb-2">
            <Brain className="w-16 h-16 text-flowstate-purple animate-pulse-light" />
            <div className="absolute inset-0 bg-flowstate-purple/10 rounded-full animate-pulse-light" />
          </div>
        </div>
        
        <Card className="w-full bg-white shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-flowstate-purple">FlowState AI</CardTitle>
            <CardDescription>Define the task you want to focus on</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="task-title" className="text-sm font-medium">
                  What do you want to accomplish?
                </label>
                <Input
                  id="task-title"
                  placeholder="e.g., Write research paper introduction"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="border-flowstate-blue/30 focus:border-flowstate-purple"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="task-description" className="text-sm font-medium">
                  Add some details (optional)
                </label>
                <Textarea
                  id="task-description"
                  placeholder="Describe your task in more detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] border-flowstate-blue/30 focus:border-flowstate-purple"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="task-priority" className="text-sm font-medium">
                  Priority
                </label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as PriorityLevel)}
                >
                  <SelectTrigger id="task-priority" className="w-full border-flowstate-blue/30 focus:border-flowstate-purple">
                    <SelectValue placeholder="Select priority" />
                    <Flag className="h-4 w-4 ml-2" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="task-due-date" className="text-sm font-medium">
                  Due Date (optional)
                </label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="task-due-date"
                      className="w-full justify-start text-left font-normal border-flowstate-blue/30 focus:border-flowstate-purple"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => {
                        setDueDate(date);
                        setCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-flowstate-purple hover:bg-flowstate-purple/90 text-white"
                disabled={!title.trim()}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Start FlowState Journey
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>FlowState AI helps you initiate and sustain focus on important tasks</p>
        </div>
      </div>
    </div>
  );
};

export default TaskSetup;
