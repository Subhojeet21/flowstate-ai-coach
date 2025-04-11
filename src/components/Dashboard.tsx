
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlowState } from '@/context/FlowStateContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Play, LineChart, History, PlusCircle, Edit, Timer, Lightbulb, ClipboardCheck } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { currentTask, activeSession, completedTasks, completeCurrentTask } = useFlowState();
  const navigate = useNavigate();
  
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

  const handleCompleteTask = () => {
    completeCurrentTask();
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-flowstate-purple"
                      onClick={editCurrentTask}
                    >
                      <Edit className="h-4 w-4" />
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
                  <h4 className="font-medium">{currentTask.title}</h4>
                  {currentTask.description && (
                    <p className="text-sm text-muted-foreground mt-1">{currentTask.description}</p>
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
            <CardFooter>
              <Button
                onClick={startNewSession}
                className="w-full bg-flowstate-teal hover:bg-flowstate-teal/90 text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Focus Session
              </Button>
            </CardFooter>
          )}
        </Card>
        
        <div className="flex flex-col space-y-2">
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
    </div>
  );
};

export default Dashboard;
