
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlowState } from '@/context/FlowStateContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow, format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, CheckCircle, AlertTriangle, Star, CircleDot } from 'lucide-react';

const TaskHistory: React.FC = () => {
  const { completedTasks } = useFlowState();
  const navigate = useNavigate();
  
  const goBack = () => {
    navigate('/');
  };

  const getTotalDuration = (taskId: string) => {
    const task = completedTasks.find(task => task.id === taskId);
    if (!task) return 0;
    
    return task.sessions.reduce((total, session) => {
      return total + (session.duration || 0);
    }, 0);
  };

  const getSessionCount = (taskId: string) => {
    const task = completedTasks.find(task => task.id === taskId);
    if (!task) return 0;
    
    return task.sessions.length;
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <Card className="w-full bg-white shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center">
            <Button variant="ghost" size="sm" className="mr-2 h-8 w-8 p-0" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-xl font-bold text-flowstate-purple">Completed Tasks</CardTitle>
              <p className="text-sm text-muted-foreground">Your task history</p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {completedTasks.length > 0 ? (
              <ScrollArea className="h-[450px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Total Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{task.title}</span>
                            {task.description && (
                              <span className="text-xs text-muted-foreground">{task.description}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getPriorityIcon(task.priority)}
                            <span className="ml-2">
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {task.dueDate ? (
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-flowstate-blue" />
                              {format(new Date(task.dueDate), 'PP')}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-flowstate-purple" />
                            {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CheckCircle className="mr-2 h-4 w-4 text-flowstate-teal" />
                            {getSessionCount(task.id)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-flowstate-purple" />
                            {getTotalDuration(task.id)} minutes
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-md">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-1">No completed tasks yet</h3>
                <p className="text-muted-foreground">
                  When you complete tasks, they will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskHistory;
