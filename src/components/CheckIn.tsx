
import React, { useState } from 'react';
import { useFlowState } from '@/context/FlowStateContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserState, EnergyLevel, EmotionalState } from '@/types';
import { ActivitySquare, BatteryLow, BatteryMedium, BatteryFull, ArrowRight } from 'lucide-react';

const CheckIn: React.FC = () => {
  const { startSession } = useFlowState();
  const [energy, setEnergy] = useState<EnergyLevel>('medium');
  const [emotion, setEmotion] = useState<EmotionalState>('neutral');
  const [blockingThoughts, setBlockingThoughts] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userState: UserState = {
      energy,
      emotion,
      blockingThoughts: blockingThoughts.trim() || undefined,
    };
    startSession(userState);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <Card className="w-full bg-white shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-flowstate-purple">Pre-Session Check-In</CardTitle>
            <CardDescription>Let's assess your current state to optimize your focus</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">How's your energy level right now?</Label>
                <RadioGroup value={energy} onValueChange={(value) => setEnergy(value as EnergyLevel)} className="grid grid-cols-3 gap-2">
                  <div>
                    <RadioGroupItem value="low" id="energy-low" className="peer sr-only" />
                    <Label
                      htmlFor="energy-low"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-flowstate-purple peer-data-[state=checked]:bg-flowstate-blue/10"
                    >
                      <BatteryLow className="mb-2 h-6 w-6" />
                      <span>Low</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="medium" id="energy-medium" className="peer sr-only" />
                    <Label
                      htmlFor="energy-medium"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-flowstate-purple peer-data-[state=checked]:bg-flowstate-blue/10"
                    >
                      <BatteryMedium className="mb-2 h-6 w-6" />
                      <span>Medium</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="high" id="energy-high" className="peer sr-only" />
                    <Label
                      htmlFor="energy-high"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-flowstate-purple peer-data-[state=checked]:bg-flowstate-blue/10"
                    >
                      <BatteryFull className="mb-2 h-6 w-6" />
                      <span>High</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-medium">How do you feel about your task?</Label>
                <RadioGroup value={emotion} onValueChange={(value) => setEmotion(value as EmotionalState)} className="grid grid-cols-2 gap-2">
                  <div>
                    <RadioGroupItem value="eager" id="emotion-eager" className="peer sr-only" />
                    <Label
                      htmlFor="emotion-eager"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-flowstate-purple peer-data-[state=checked]:bg-flowstate-blue/10"
                    >
                      <span className="text-2xl">😊</span>
                      <span>Eager</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="neutral" id="emotion-neutral" className="peer sr-only" />
                    <Label
                      htmlFor="emotion-neutral"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-flowstate-purple peer-data-[state=checked]:bg-flowstate-blue/10"
                    >
                      <span className="text-2xl">😐</span>
                      <span>Neutral</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="anxious" id="emotion-anxious" className="peer sr-only" />
                    <Label
                      htmlFor="emotion-anxious"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-flowstate-purple peer-data-[state=checked]:bg-flowstate-blue/10"
                    >
                      <span className="text-2xl">😰</span>
                      <span>Anxious</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="overwhelmed" id="emotion-overwhelmed" className="peer sr-only" />
                    <Label
                      htmlFor="emotion-overwhelmed"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-flowstate-purple peer-data-[state=checked]:bg-flowstate-blue/10"
                    >
                      <span className="text-2xl">😫</span>
                      <span>Overwhelmed</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="blocking-thoughts" className="text-base font-medium">
                  Any blocking thoughts? (optional)
                </Label>
                <Textarea
                  id="blocking-thoughts"
                  placeholder="e.g., I don't know where to start..."
                  value={blockingThoughts}
                  onChange={(e) => setBlockingThoughts(e.target.value)}
                  className="border-flowstate-blue/30 focus:border-flowstate-purple"
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-flowstate-purple hover:bg-flowstate-purple/90 text-white"
              >
                <ActivitySquare className="mr-2 h-4 w-4" />
                Generate Focus Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CheckIn;
