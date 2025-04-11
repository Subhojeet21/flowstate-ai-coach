
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FlowStateProvider } from '@/context/FlowStateContext';
import Dashboard from '@/components/Dashboard';
import TaskSetup from '@/components/TaskSetup';
import CheckIn from '@/components/CheckIn';
import InterventionSuggestion from '@/components/InterventionSuggestion';
import WorkSession from '@/components/WorkSession';
import PostSessionReview from '@/components/PostSessionReview';
import SessionHistory from '@/components/SessionHistory';

const Index = () => {
  return (
    <FlowStateProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/task-setup" element={<TaskSetup />} />
        <Route path="/check-in" element={<CheckIn />} />
        <Route path="/intervention" element={<InterventionSuggestion />} />
        <Route path="/session" element={<WorkSession />} />
        <Route path="/review" element={<PostSessionReview />} />
        <Route path="/history" element={<SessionHistory />} />
      </Routes>
    </FlowStateProvider>
  );
};

export default Index;
