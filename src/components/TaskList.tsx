
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlowState } from '@/context/FlowStateContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format, isToday } from 'date-fns';
import { ArrowLeft, Calendar, Clock, Flag, AlertTriangle, CircleDot, Star } from 'lucide-react';

const TaskList: React.FC = () => {
  const { tasks, setCurrentTask, currentTask } = useFlowState();
  const navigate = useNavigate();
  
  const goBack = () => {
    navigate('/');
  };

  const handleSelectTask = (taskId: string) => {
    setCurrentTask(taskId);
    navigate('/');
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Star className="h-4 w-4 text-amber-500" />;
      case 'low':
        return <CircleDot className="h-4 w-4 text-green-500" />;
      default:
        return <Flag className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Group tasks by priority
  const highPriorityTasks = tasks.filter(task => task.priority === 'high');
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium');
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low');

  // Combine in priority order
  const sortedTasks = [...highPriorityTasks, ...mediumPriorityTasks, ...lowPriorityTasks];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <Card className="w-full bg-white shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center">
            <Button variant="ghost" size="sm" className="mr-2 h-8 w-8 p-0" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-xl font-bold text-flowstate-purple">All Tasks</CardTitle>
              <p className="text-sm text-muted-foreground">Select a task to work on</p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {sortedTasks.length > 0 ? (
              <div className="space-y-3">
                {sortedTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`p-4 border rounded-md ${
                      currentTask?.id === task.id ? 'border-flowstate-purple bg-flowstate-purple/5' : 'border-gray-200'
                    } hover:bg-gray-50 cursor-pointer transition-colors`}
                    onClick={() => handleSelectTask(task.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                        {getPriorityIcon(task.priority)}
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-3 text-xs">
                      {task.dueDate && (
                        <div className="flex items-center text-flowstate-blue">
                          <Calendar className="mr-1 h-3 w-3" />
                          {isToday(new Date(task.dueDate)) 
                            ? 'Due Today' 
                            : `Due ${format(new Date(task.dueDate), 'PP')}`}
                        </div>
                      )}
                      <div className="flex items-center text-flowstate-purple">
                        <Clock className="mr-1 h-3 w-3" />
                        Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                      </div>
                      <div className="flex items-center text-flowstate-teal">
                        <Clock className="mr-1 h-3 w-3" />
                        {task.sessions.length} {task.sessions.length === 1 ? 'session' : 'sessions'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-md">
                <div className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4">
                  <Flag className="h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium mb-1">No tasks yet</h3>
                <p className="text-muted-foreground">
                  Create a task to get started
                </p>
                <Button
                  onClick={() => navigate('/task-setup')}
                  className="mt-4 bg-flowstate-purple hover:bg-flowstate-purple/90 text-white"
                >
                  Create Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskList;
