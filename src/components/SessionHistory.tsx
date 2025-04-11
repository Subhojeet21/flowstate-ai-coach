
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlowState } from '@/context/FlowStateContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Clock, CalendarCheck, Smile, Frown, Meh } from 'lucide-react';

const SessionHistory: React.FC = () => {
  const { currentTask } = useFlowState();
  const navigate = useNavigate();
  
  const goBack = () => {
    navigate('/');
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'eager':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'neutral':
        return <Meh className="h-4 w-4 text-yellow-500" />;
      case 'anxious':
      case 'overwhelmed':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-500';
      case 'okay':
        return 'text-yellow-500';
      case 'hard':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <Card className="w-full bg-white shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center">
            <Button variant="ghost" size="sm" className="mr-2 h-8 w-8 p-0" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-xl font-bold text-flowstate-purple">Session History</CardTitle>
              {currentTask && <p className="text-sm text-muted-foreground">for {currentTask.title}</p>}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {currentTask && currentTask.sessions.length > 0 ? (
              <div className="space-y-3">
                {[...currentTask.sessions].reverse().map((session) => (
                  <div key={session.id} className="bg-muted/20 p-3 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <CalendarCheck className="h-4 w-4 mr-1.5 text-flowstate-purple" />
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1.5 text-flowstate-purple" />
                        <span className="text-sm">{session.duration || 0} min</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm mt-3">
                      <div className="flex flex-col items-center p-2 bg-white rounded shadow-sm">
                        <span className="text-xs text-muted-foreground mb-1">Energy</span>
                        <span className="font-medium capitalize">{session.state.energy}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-white rounded shadow-sm">
                        <span className="text-xs text-muted-foreground mb-1">Emotion</span>
                        <div className="flex items-center">
                          {getEmotionIcon(session.state.emotion)}
                          <span className="font-medium capitalize ml-1">{session.state.emotion}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-white rounded shadow-sm">
                        <span className="text-xs text-muted-foreground mb-1">Difficulty</span>
                        <span className={`font-medium capitalize ${getDifficultyColor(session.feedback?.difficulty)}`}>
                          {session.feedback?.difficulty || 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    {session.feedback?.notes && (
                      <div className="mt-3 text-sm p-2 bg-white/50 rounded">
                        <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                        <p>{session.feedback.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No session history available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SessionHistory;
