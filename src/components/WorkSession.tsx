import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlowState } from '@/context/FlowStateContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Timer, Pause, Play, CheckCircle, RefreshCw } from 'lucide-react';

const WorkSession: React.FC = () => {
  const { currentTask, activeSession } = useFlowState();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { userState, getSuggestedInterventions } = useFlowState();
  if (!userState) {
    navigate('/check-in');
    return null;
  }

  const suggestedInterventions = getSuggestedInterventions();
  const activeIntervention = activeSession?.selectedIntervention || suggestedInterventions[0] || null;
  
  const sessionDuration = (activeIntervention ? activeIntervention.duration : 25) * 60;
  //console.log(activeIntervention);
  const activeInterventionId = activeIntervention ? activeIntervention.id : 3;
  const [secondsLeft, setSecondsLeft] = useState(sessionDuration); 
  const [isRunning, setIsRunning] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let interval: number | undefined;
    
    if (isRunning && secondsLeft > 0) {
      interval = window.setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && !isComplete) {
      setIsComplete(true);
      setIsRunning(false);
      toast({
        title: "Session Complete!",
        description: "You've completed your work session. Great job!",
      });
    }
    
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, isComplete, toast]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setSecondsLeft(sessionDuration);
    setIsRunning(false);
    setIsComplete(false);
  };

  const endSession = () => {
    //console.log("Session ended by user");
    toast({
      title: "Session Ended",
      description: "Let's review how it went!",
    });
    navigate('/review');
  };

  const progressPercentage = (1 - secondsLeft / sessionDuration) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <Card className="w-full bg-white shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-flowstate-purple">Focus Session</CardTitle>
            {currentTask && (
              <p className="mt-2 text-flowstate-dark">
                Working on: <span className="font-medium">{currentTask.title}</span>
              </p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-flowstate-blue/10"></div>
                <div className="z-10 text-4xl font-bold text-flowstate-purple">
                  {formatTime(secondsLeft)}
                </div>
              </div>
              
              <Progress 
                value={progressPercentage} 
                className="w-full h-2 mt-6 bg-flowstate-blue/20" 
              />
              
              <div className="flex mt-6 space-x-4">
                <Button 
                  onClick={toggleTimer} 
                  variant="outline"
                  className="h-12 w-12 rounded-full p-0 border-2 border-flowstate-purple"
                >
                  {isRunning ? (
                    <Pause className="h-5 w-5 text-flowstate-purple" />
                  ) : (
                    <Play className="h-5 w-5 text-flowstate-purple" />
                  )}
                </Button>
                
                <Button 
                  onClick={resetTimer} 
                  variant="outline"
                  className="h-12 w-12 rounded-full p-0 border-2 border-flowstate-purple/70"
                >
                  <RefreshCw className="h-5 w-5 text-flowstate-purple/70" />
                </Button>
              </div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-md">
              <h3 className="font-medium mb-2 flex items-center">
                <Timer className="h-4 w-4 mr-2 text-flowstate-purple" />
                Tips for maintaining focus:
              </h3>
              {activeInterventionId === '1' && (
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Take a comfortable seat.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Place one hand on your belly and the other on your chest.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Inhale deeply through your nose for a count of 4, hold for 7.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Exhale slowly through pursed lips for a count of 8.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Repeat for 2 minutes.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Diaphragmatic breathing and the 4-7-8 method are excellent options.</span>
                  </li>
                </ul>
              )}
              {activeInterventionId === '2' && (
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Pick the smallest possible action related to your task.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Completing this will help build momentum.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Micro-tasks reduce mental weight and make large goals more approachable.</span>
                  </li>
                </ul>
              )}
              {activeInterventionId === '3' && (
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Stay in the present moment and focus only on this task</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>If distracted, gently bring your attention back to the task</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Remember your "why" - what makes this task important to you</span>
                  </li>
                </ul>
              )}
              {activeInterventionId === '4' && (
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Pause for a moment.</span>
                  </li>  
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Ask yourself - Why is completing this task important.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Think about how does it align with your long-term goals.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Reflection strengthens self-awareness and motivation.</span>
                  </li>

                </ul>
              )}
              {activeInterventionId === '5' && (
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Set this time for uninterrupted work.</span>
                  </li>  
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Silence notifications and clear your workspace.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Focus entirely on making substantial progress.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Extended focus blocks help tackle complex tasks effectively.</span>
                  </li>

                </ul>
              )}
              {activeInterventionId === '6' && (
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>If you feel overwhelmed, reframe your thoughts.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Challenge negative thoughts about the task.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Repeat-This is challenging, but I can simplify and succeed.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Reframing helps shift perspective and reduce anxiety.</span>
                  </li>

                </ul>
              )}
              {activeInterventionId === '7' && (
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Spend 5 minutes tidying up your desk or workspace.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Remove distractions like unnecessary papers or devices.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>A clean environment fosters clarity and productivity.</span>
                  </li>

                </ul>
              )}
              {activeInterventionId === '8' && (
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Close your eyes & visualize yourself completing the task successfully.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Picture how accomplished you’ll feel once you complete the task.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-flowstate-teal mt-0.5" />
                    <span>Visualization boosts motivation by reinforcing positive outcomes.</span>
                  </li>

                </ul>
              )}
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full bg-flowstate-teal hover:bg-flowstate-teal/90 text-white"
              onClick={endSession}
            >
              End Session & Review
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default WorkSession;
