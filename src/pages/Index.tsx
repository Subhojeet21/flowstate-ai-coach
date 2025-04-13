
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { FlowStateProvider } from "@/context/FlowStateContext";
import Dashboard from "@/components/Dashboard";
import TaskSetup from "@/components/TaskSetup";
import CheckIn from "@/components/CheckIn";
import InterventionSuggestion from "@/components/InterventionSuggestion";
import WorkSession from "@/components/WorkSession";
import PostSessionReview from "@/components/PostSessionReview";
import SessionHistory from "@/components/SessionHistory";
import TaskHistory from "@/components/TaskHistory";
import TaskList from "@/components/TaskList";
import Login from "@/components/Login";
import { Toaster } from "@/components/ui/toaster";

const Index: React.FC = () => {
  return (
    <FlowStateProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/task-setup" element={<TaskSetup />} />
        <Route path="/check-in" element={<CheckIn />} />
        <Route path="/intervention" element={<InterventionSuggestion />} />
        <Route path="/session" element={<WorkSession />} />
        <Route path="/review" element={<PostSessionReview />} />
        <Route path="/history" element={<SessionHistory />} />
        <Route path="/task-history" element={<TaskHistory />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </FlowStateProvider>
  );
};

export default Index;
