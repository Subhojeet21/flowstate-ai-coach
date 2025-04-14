
import { FlowStateState, FlowStateAction } from './types';
import { UserState } from '@/types';
import { interventions } from '@/data/interventions';

const defaultUserState: UserState = {
  energy: 'medium',
  emotion: 'neutral',
};

export const initialState: FlowStateState = {
  currentUser: null,
  tasks: [],
  currentTask: null,
  completedTasks: [],
  sessions: [],
  activeSession: null,
  userState: defaultUserState,
  interventions: interventions,
};

export const flowStateReducer = (state: FlowStateState, action: FlowStateAction): FlowStateState => {
  switch (action.type) {
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        currentTask: state.currentTask || (action.payload.length > 0 ? action.payload[0] : null),
      };
    
    case 'SET_COMPLETED_TASKS':
      return {
        ...state,
        completedTasks: action.payload,
      };
    
    case 'CREATE_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        currentTask: state.currentTask === null ? action.payload : state.currentTask,
      };

    case 'START_SESSION':
      return {
        ...state,
        activeSession: action.payload,
        userState: action.payload.state,
      };

    case 'END_SESSION':
      const endedSession = action.payload;
      const updatedTasks = state.tasks.map(task => 
        task.id === endedSession.taskId 
          ? { ...task, sessions: [...task.sessions, endedSession] } 
          : task
      );
      
      const updatedCurrentTask = state.currentTask && state.currentTask.id === endedSession.taskId
        ? { ...state.currentTask, sessions: [...state.currentTask.sessions, endedSession] }
        : state.currentTask;

      return {
        ...state,
        sessions: [...state.sessions, endedSession],
        tasks: updatedTasks,
        currentTask: updatedCurrentTask,
        activeSession: null,
      };

    case 'SET_USER_STATE':
      return {
        ...state,
        userState: action.payload,
      };

    case 'COMPLETE_CURRENT_TASK':
      if (!state.currentTask) return state;
      
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload.id),
        completedTasks: [...state.completedTasks, action.payload],
        currentTask: state.tasks.filter(task => task.id !== action.payload.id)[0] || null,
      };

    case 'DELETE_CURRENT_TASK':
      if (!state.currentTask) return state;
      
      const tasksAfterDeletion = state.tasks.filter(task => task.id !== state.currentTask?.id);
      
      return {
        ...state,
        tasks: tasksAfterDeletion,
        currentTask: tasksAfterDeletion.length > 0 ? tasksAfterDeletion[0] : null,
      };

    case 'SET_CURRENT_TASK':
      const taskToSet = state.tasks.find(task => task.id === action.payload);
      if (!taskToSet) return state;
      
      return {
        ...state,
        currentTask: taskToSet,
      };

    case 'SET_USER':
      return {
        ...state,
        currentUser: action.payload,
      };

    case 'RESET_ALL':
      return {
        ...initialState,
        currentUser: state.currentUser,
      };

    default:
      return state;
  }
};
