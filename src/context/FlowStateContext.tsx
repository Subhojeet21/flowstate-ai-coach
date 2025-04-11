
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Task, Session, UserState, Intervention } from '@/types';
import { interventions } from '@/data/interventions';

interface FlowStateContextType {
  currentTask: Task | null;
  activeSession: Session | null;
  interventions: Intervention[];
  userState: UserState | null;
  isInSession: boolean;
  createTask: (title: string, description?: string) => void;
  startSession: (state: UserState) => void;
  endSession: (feedback: Session['feedback']) => void;
  setUserState: (state: UserState) => void;
  resetAll: () => void;
  getSuggestedInterventions: () => Intervention[];
}

const defaultUserState: UserState = {
  energy: 'medium',
  emotion: 'neutral',
};

type FlowStateAction =
  | { type: 'CREATE_TASK'; payload: { title: string; description?: string } }
  | { type: 'START_SESSION'; payload: UserState }
  | { type: 'END_SESSION'; payload: Session['feedback'] }
  | { type: 'SET_USER_STATE'; payload: UserState }
  | { type: 'RESET_ALL' };

interface FlowStateState {
  currentTask: Task | null;
  sessions: Session[];
  activeSession: Session | null;
  userState: UserState;
  interventions: Intervention[];
}

const initialState: FlowStateState = {
  currentTask: null,
  sessions: [],
  activeSession: null,
  userState: defaultUserState,
  interventions: interventions,
};

const FlowStateContext = createContext<FlowStateContextType | undefined>(undefined);

const flowStateReducer = (state: FlowStateState, action: FlowStateAction): FlowStateState => {
  switch (action.type) {
    case 'CREATE_TASK':
      const newTask: Task = {
        id: Date.now().toString(),
        title: action.payload.title,
        description: action.payload.description,
        createdAt: new Date(),
        sessions: [],
      };
      return {
        ...state,
        currentTask: newTask,
      };

    case 'START_SESSION':
      if (!state.currentTask) return state;
      
      const newSession: Session = {
        id: Date.now().toString(),
        taskId: state.currentTask.id,
        startTime: new Date(),
        state: action.payload,
        completed: false,
      };
      
      return {
        ...state,
        activeSession: newSession,
        userState: action.payload,
      };

    case 'END_SESSION':
      if (!state.activeSession) return state;
      
      const endedSession: Session = {
        ...state.activeSession,
        endTime: new Date(),
        duration: Math.floor(
          (new Date().getTime() - state.activeSession.startTime.getTime()) / 60000
        ),
        completed: true,
        feedback: action.payload,
      };
      
      const updatedSessions = [...state.sessions, endedSession];
      const updatedTask = state.currentTask 
        ? { ...state.currentTask, sessions: [...state.currentTask.sessions, endedSession] }
        : null;

      return {
        ...state,
        sessions: updatedSessions,
        currentTask: updatedTask,
        activeSession: null,
      };

    case 'SET_USER_STATE':
      return {
        ...state,
        userState: action.payload,
      };

    case 'RESET_ALL':
      return initialState;

    default:
      return state;
  }
};

export const FlowStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(flowStateReducer, initialState);

  const createTask = (title: string, description?: string) => {
    dispatch({ type: 'CREATE_TASK', payload: { title, description } });
  };

  const startSession = (userState: UserState) => {
    dispatch({ type: 'START_SESSION', payload: userState });
  };

  const endSession = (feedback: Session['feedback']) => {
    dispatch({ type: 'END_SESSION', payload: feedback });
  };

  const setUserState = (userState: UserState) => {
    dispatch({ type: 'SET_USER_STATE', payload: userState });
  };

  const resetAll = () => {
    dispatch({ type: 'RESET_ALL' });
  };

  const getSuggestedInterventions = (): Intervention[] => {
    if (!state.userState) return [];

    return state.interventions.filter(intervention => {
      return (
        intervention.forEnergy.includes(state.userState.energy) &&
        intervention.forEmotions.includes(state.userState.emotion)
      );
    });
  };

  return (
    <FlowStateContext.Provider
      value={{
        currentTask: state.currentTask,
        activeSession: state.activeSession,
        interventions: state.interventions,
        userState: state.userState,
        isInSession: !!state.activeSession,
        createTask,
        startSession,
        endSession,
        setUserState,
        resetAll,
        getSuggestedInterventions,
      }}
    >
      {children}
    </FlowStateContext.Provider>
  );
};

export const useFlowState = (): FlowStateContextType => {
  const context = useContext(FlowStateContext);
  if (context === undefined) {
    throw new Error('useFlowState must be used within a FlowStateProvider');
  }
  return context;
};
