
import React, { useState } from 'react';
import { useFlowState } from '@/context/FlowStateContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Session } from '@/types';
import { ThumbsUp, ArrowRight, CheckCircle, FileClock } from 'lucide-react';

const PostSessionReview: React.FC = () => {
  const { endSession } = useFlowState();
  const [difficulty, setDifficulty] = useState<Session['feedback']['difficulty']>('okay');
  const [progressMade, setProgressMade] = useState(true);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    endSession({
      difficulty,
      progressMade,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <Card className="w-full bg-white shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-flowstate-purple">Session Review</CardTitle>
            <CardDescription>Reflect on your focus session to help improve future sessions</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">How difficult was it to maintain focus?</Label>
                <RadioGroup 
                  value={difficulty} 
                  onValueChange={(value) => setDifficulty(value as Session['feedback']['difficulty'])}
                  className="grid grid-cols-3 gap-3"
                >
                  <div>
                    <RadioGroupItem value="easy" id="difficulty-easy" className="peer sr-only" />
                    <Label
                      htmlFor="difficulty-easy"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-flowstate-teal peer-data-[state=checked]:bg-flowstate-teal/10"
                    >
                      <span className="text-xl">😊</span>
                      <span>Easy</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="okay" id="difficulty-okay" className="peer sr-only" />
                    <Label
                      htmlFor="difficulty-okay"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-flowstate-teal peer-data-[state=checked]:bg-flowstate-teal/10"
                    >
                      <span className="text-xl">😐</span>
                      <span>Okay</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="hard" id="difficulty-hard" className="peer sr-only" />
                    <Label
                      htmlFor="difficulty-hard"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-flowstate-teal peer-data-[state=checked]:bg-flowstate-teal/10"
                    >
                      <span className="text-xl">😓</span>
                      <span>Hard</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-medium">Did you make progress on your task?</Label>
                <RadioGroup 
                  value={progressMade ? "yes" : "no"} 
                  onValueChange={(value) => setProgressMade(value === "yes")}
                  className="grid grid-cols-2 gap-3"
                >
                  <div>
                    <RadioGroupItem value="yes" id="progress-yes" className="peer sr-only" />
                    <Label
                      htmlFor="progress-yes"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-flowstate-teal peer-data-[state=checked]:bg-flowstate-teal/10"
                    >
                      <ThumbsUp className="mb-1 h-5 w-5" />
                      <span>Yes</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="no" id="progress-no" className="peer sr-only" />
                    <Label
                      htmlFor="progress-no"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-flowstate-teal peer-data-[state=checked]:bg-flowstate-teal/10"
                    >
                      <ThumbsUp className="mb-1 h-5 w-5 rotate-180" />
                      <span>No</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="session-notes" className="text-base font-medium">
                  Any reflections on your session? (optional)
                </Label>
                <Textarea
                  id="session-notes"
                  placeholder="e.g., I noticed I got distracted by notifications..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] border-flowstate-blue/30 focus:border-flowstate-teal"
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-flowstate-purple hover:bg-flowstate-purple/90 text-white"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PostSessionReview;
