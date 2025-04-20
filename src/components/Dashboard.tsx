import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlowState } from '@/context/FlowStateContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Brain, Play, History, PlusCircle, Edit, Timer, Lightbulb, ClipboardCheck, LogOut, AlertTriangle, Star, CircleDot, ListChecks, Calendar, Trash2, List, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, isToday } from 'date-fns';

const Dashboard: React.FC = () => {
  const { 
    currentUser, 
    currentTask, 
    activeSession, 
    completedTasks, 
    completeCurrentTask,
    deleteCurrentTask,
    tasks,
    getTodaysTasks,
    logoutUser 
  } = useFlowState();
  const navigate = useNavigate();
  
  
  // Get today's tasks and sort by priority
  const todaysTasks = getTodaysTasks();
  
  const totalSessions = currentTask?.sessions.length || 0;
  const totalMinutes = currentTask?.sessions.reduce((acc, session) => acc + (session.duration || 0), 0) || 0;
  
  const startNewSession = () => {
    navigate('/check-in');
  };
  
  const editCurrentTask = () => {
    navigate('/task-setup');
  };
  
  const viewSessionHistory = () => {
    navigate('/history');
  };

  const viewTaskHistory = () => {
    navigate('/task-history');
  };

  const viewAllTasks = () => {
    navigate('/tasks');
  };

  const handleCompleteTask = () => {
    completeCurrentTask();
  };

  const handleDeleteTask = () => {
    deleteCurrentTask();
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
        return null;
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
      <div className="w-full max-w-md pb-16"> {/* Added padding bottom to accommodate footer */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex items-center justify-center w-16 h-16">
            <Brain className="w-12 h-12 text-flowstate-purple animate-pulse-light" />
            <div className="absolute inset-0 bg-flowstate-purple/10 rounded-full animate-pulse-light" />
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-2 mb-1">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">{currentUser.name || 'User'}</span>
                <span className="text-xs text-muted-foreground">{currentUser.email}</span>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm">Log out?</p>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={logoutUser}
                    >
                      Log Out
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center bg-flowstate-teal/10 px-3 py-1 rounded-full text-flowstate-teal">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">{currentUser.streak.count} Day Streak</span>
            </div>
          </div>
        </div>
        
        <Card className="w-full bg-white shadow-md mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-flowstate-purple">FlowState AI</CardTitle>
            <CardDescription>Your AI focus coach</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {currentTask ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Current Task</h3>
                  <div className="flex space-x-1">
                    {/*<Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-flowstate-purple"
                      onClick={editCurrentTask} 
                      title="Create a new task"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>*/}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleDeleteTask}
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-flowstate-teal"
                      onClick={handleCompleteTask}
                      title="Mark as completed"
                    >
                      <ClipboardCheck className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-flowstate-blue/10 p-3 rounded-md">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-medium">{currentTask.title}</h4>
                    <Badge className="flex items-center gap-1 text-xs">
                      {getPriorityIcon(currentTask.priority)}
                      {currentTask.priority.charAt(0).toUpperCase() + currentTask.priority.slice(1)}
                    </Badge>
                  </div>
                  {currentTask.description && (
                    <p className="text-sm text-muted-foreground mt-1">{currentTask.description}</p>
                  )}
                  {currentTask.dueDate && (
                    <div className="flex items-center text-xs mt-2 text-flowstate-blue">
                      <Calendar className="mr-1 h-3 w-3" />
                      {isToday(new Date(currentTask.dueDate)) 
                        ? 'Due Today' 
                        : `Due ${format(new Date(currentTask.dueDate), 'PP')}`}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-muted/30 p-3 rounded-md flex flex-col items-center">
                    <Timer className="h-5 w-5 mb-1 text-flowstate-purple" />
                    <span className="text-lg font-bold">{totalMinutes}</span>
                    <span className="text-xs text-muted-foreground">Minutes</span>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md flex flex-col items-center">
                    <Lightbulb className="h-5 w-5 mb-1 text-flowstate-purple" />
                    <span className="text-lg font-bold">{totalSessions}</span>
                    <span className="text-xs text-muted-foreground">Sessions</span>
                  </div>
                </div>
                
                {totalSessions > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Focus Progress</span>
                      <span className="font-medium">
                        {Math.min(totalSessions, 5)}/5 Sessions
                      </span>
                    </div>
                    <Progress value={(totalSessions / 5) * 100} className="h-2 bg-flowstate-blue/20" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center p-6 bg-muted/20 rounded-md">
                <p className="text-center mb-4">No active task. Set up a task to begin.</p>
                <Button
                  onClick={editCurrentTask}
                  className="bg-flowstate-purple hover:bg-flowstate-purple/90 text-white"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </div>
            )}
          </CardContent>
          
          {currentTask && (
            <CardFooter className="flex flex-col gap-2">
              <Button
                onClick={startNewSession}
                className="w-full bg-flowstate-teal hover:bg-flowstate-teal/90 text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Focus Session
              </Button>
              {/*<Button
                onClick={editCurrentTask}
                variant="ghost"
                className="w-full text-flowstate-purple border border-flowstate-purple/50 hover:bg-flowstate-purple/10"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Task
              </Button>*/}
              <Button
                  onClick={editCurrentTask}
                  className="bg-flowstate-purple hover:bg-flowstate-purple/90 text-white"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Task
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Today's Tasks Section */}
        <Card className="w-full bg-white shadow-md mb-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold text-flowstate-purple">Today's Tasks</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={viewAllTasks}
                className="text-flowstate-purple hover:text-flowstate-purple/90"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {todaysTasks.length > 0 ? (
              todaysTasks.map((task) => (
                <div 
                  key={task.id}
                  className={`p-3 border rounded-md cursor-pointer hover:bg-muted/20 transition-colors ${
                    currentTask?.id === task.id ? 'border-flowstate-purple bg-flowstate-purple/5' : 'border-gray-200'
                  }`}
                  onClick={() => navigate('/tasks')}
                >
                  <div className="flex justify-between mb-1">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <div className="flex items-center text-xs">
                      {getPriorityIcon(task.priority)}
                    </div>
                  </div>
                  {task.dueDate && isToday(new Date(task.dueDate)) && (
                    <div className="flex items-center text-xs mt-1 text-red-500">
                      <Calendar className="mr-1 h-3 w-3" />
                      Due Today
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 bg-muted/20 rounded-md">
                <p className="text-sm text-muted-foreground">No tasks due today</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            className="w-full border-flowstate-purple text-flowstate-purple hover:bg-flowstate-purple/10"
            onClick={viewAllTasks}
          >
            <ListChecks className="mr-2 h-4 w-4" />
            All Tasks
            <span className="ml-1.5 bg-flowstate-purple/20 text-flowstate-purple text-xs rounded-full px-2 py-0.5">
              {tasks.length}
            </span>
          </Button>
          
          {currentTask && totalSessions > 0 && (
            <Button
              variant="outline"
              className="w-full border-flowstate-purple text-flowstate-purple hover:bg-flowstate-purple/10"
              onClick={viewSessionHistory}
            >
              <History className="mr-2 h-4 w-4" />
              View Session History
            </Button>
          )}
          
          <Button
            variant="outline"
            className="w-full border-flowstate-teal text-flowstate-teal hover:bg-flowstate-teal/10"
            onClick={viewTaskHistory}
          >
            <ClipboardCheck className="mr-2 h-4 w-4" />
            View Completed Tasks
            {completedTasks.length > 0 && (
              <span className="ml-1.5 bg-flowstate-teal/20 text-flowstate-teal text-xs rounded-full px-2 py-0.5">
                {completedTasks.length}
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {/* New Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button
            onClick={viewAllTasks}
            className="flex flex-col items-center p-2 text-flowstate-purple hover:text-flowstate-purple/90"
          >
            <List className="h-6 w-6" />
            <span className="text-xs mt-1">All Tasks</span>
          </button>

          {currentTask && totalSessions > 0 && (
            <button
              onClick={viewSessionHistory}
              className="flex flex-col items-center p-2 text-flowstate-purple hover:text-flowstate-purple/90"
            >
              <History className="h-6 w-6" />
              <span className="text-xs mt-1">History</span>
            </button>
          )}

          <button
            onClick={viewTaskHistory}
            className="flex flex-col items-center p-2 text-flowstate-purple hover:text-flowstate-purple/90"
          >
            <Check className="h-6 w-6" />
            <span className="text-xs mt-1">Completed</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
