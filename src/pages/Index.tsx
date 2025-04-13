
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { FlowStateProvider } from "@/context/FlowStateContext";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import Signup from "@/components/Signup";
import { Toaster } from "@/components/ui/toaster";

const Index: React.FC = () => {
  return (
    <FlowStateProvider>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/task-setup" element={
          <ProtectedRoute>
            <TaskSetup />
          </ProtectedRoute>
        } />
        <Route path="/check-in" element={
          <ProtectedRoute>
            <CheckIn />
          </ProtectedRoute>
        } />
        <Route path="/intervention" element={
          <ProtectedRoute>
            <InterventionSuggestion />
          </ProtectedRoute>
        } />
        <Route path="/session" element={
          <ProtectedRoute>
            <WorkSession />
          </ProtectedRoute>
        } />
        <Route path="/review" element={
          <ProtectedRoute>
            <PostSessionReview />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <SessionHistory />
          </ProtectedRoute>
        } />
        <Route path="/task-history" element={
          <ProtectedRoute>
            <TaskHistory />
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute>
            <TaskList />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </FlowStateProvider>
  );
};

export default Index;
