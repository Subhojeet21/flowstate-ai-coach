
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlowState } from '@/context/FlowStateContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Intervention } from '@/types';
import { Play, Brain, Shield, Zap, LightbulbIcon, Timer, ArrowLeft, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const InterventionSuggestion: React.FC = () => {
  const { userState, getSuggestedInterventions, startSession } = useFlowState();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedInterventionId, setSelectedInterventionId] = useState<string | null>(null);

  if (!userState) {
    navigate('/check-in');
    return null;
  }

  const suggestedInterventions = getSuggestedInterventions();
  // If no intervention is selected, default to the first one
  const mainIntervention = selectedInterventionId
    ? suggestedInterventions.find(i => i.id === selectedInterventionId)
    : suggestedInterventions[0] || null;

  const getInterventionIcon = (type: Intervention['type']) => {
    switch (type) {
      case 'emotion':
        return <Shield className="h-8 w-8 text-blue-500" />;
      case 'cognition':
        return <Brain className="h-8 w-8 text-purple-500" />;
      case 'motivation':
        return <LightbulbIcon className="h-8 w-8 text-yellow-500" />;
      case 'behavior':
        return <Zap className="h-8 w-8 text-green-500" />;
      case 'environment':
        return <Timer className="h-8 w-8 text-red-500" />;
      default:
        return <Brain className="h-8 w-8 text-flowstate-purple" />;
    }
  };

  const getStateDescription = () => {
    if (userState.energy === 'low' && (userState.emotion === 'anxious' || userState.emotion === 'overwhelmed')) {
      return "You seem to be experiencing low energy and some challenging emotions. Let's start with gentle steps to help you ease into your task.";
    } else if (
      userState.energy === 'medium' && 
      (userState.emotion === 'neutral' || userState.emotion === 'eager')
    ) {
      return "You have a moderate energy level and a balanced emotional state. Let's channel this into focused work.";
    } else if (userState.energy === 'high' && userState.emotion === 'eager') {
      return "You're energized and eager to work! Let's make the most of this positive state with substantial progress.";
    } else if (userState.blockingThoughts) {
      return "You've identified some specific thoughts that might be blocking your progress. Let's address these first.";
    } else {
      return "Based on your current state, I've recommended an intervention to help you get started and maintain focus.";
    }
  };

  const startWorkingSession = () => {
    startSession(userState, { id: selectedInterventionId, title: mainIntervention?.title || '', type: mainIntervention?.type || 'emotion',description: mainIntervention?.description || '', duration: mainIntervention?.duration || 0, 
      forEnergy: mainIntervention?.forEnergy || ['medium'], forEmotions: mainIntervention?.forEmotions || ['neutral']});
    toast({
      title: "Session Started",
      description: "Your focus session has been started. Good luck!",
    });
    navigate('/session');
  };

  const handleInterventionSelect = (interventionId: string) => {
    setSelectedInterventionId(interventionId);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <Card className="w-full bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-flowstate-purple">Your Focus Plan</CardTitle>
            <CardDescription>{getStateDescription()}</CardDescription>
          </CardHeader>
          
          {mainIntervention ? (
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4 bg-flowstate-blue/10 rounded-md">
                <div className="mb-3">
                  {getInterventionIcon(mainIntervention.type)}
                </div>
                <h3 className="text-xl font-bold text-flowstate-purple">{mainIntervention.title}</h3>
                <p className="text-center text-muted-foreground mt-2">{mainIntervention.description}</p>
                <div className="mt-3 flex items-center text-sm text-flowstate-purple">
                  <Timer className="h-4 w-4 mr-1" />
                  <span>{mainIntervention.duration} minutes</span>
                </div>
              </div>
              
              {suggestedInterventions.length > 1 && (
                <div className="mt-6">
                  <h4 className="font-medium text-center mb-2">Alternative Suggestions</h4>
                  <RadioGroup 
                    value={selectedInterventionId || suggestedInterventions[0].id} 
                    onValueChange={handleInterventionSelect}
                    className="grid grid-cols-1 gap-2"
                  >
                    {suggestedInterventions.map((intervention) => (
                      <div 
                        key={intervention.id} 
                        className={`flex items-center p-3 rounded-md transition-colors ${
                          selectedInterventionId === intervention.id 
                            ? 'bg-flowstate-purple/10 border border-flowstate-purple/30' 
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <RadioGroupItem 
                          value={intervention.id} 
                          id={`intervention-${intervention.id}`} 
                          className="mr-3"
                        />
                        <div className="mr-3">
                          {getInterventionIcon(intervention.type)}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium">{intervention.title}</h5>
                          <p className="text-xs text-muted-foreground">{intervention.duration} min</p>
                        </div>
                        {selectedInterventionId === intervention.id && (
                          <Check className="h-4 w-4 text-flowstate-teal ml-2" />
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          ) : (
            <CardContent>
              <p className="text-center py-4">
                I couldn't find specific interventions for your current state.
                Let's start with a basic focus session and adjust as needed.
              </p>
            </CardContent>
          )}
          
          <CardFooter className="flex flex-col space-y-2">
            <Button
              onClick={startWorkingSession}
              className="w-full bg-flowstate-teal hover:bg-flowstate-teal/90 text-white"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Working Session
            </Button>
            <Button
              onClick={() => navigate('/check-in')}
              variant="outline"
              className="w-full border-flowstate-purple text-flowstate-purple hover:bg-flowstate-purple/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default InterventionSuggestion;
