
import { useContext } from 'react';
import { FlowStateContext } from './FlowStateContext';
import { FlowStateContextType } from './types';

export const useFlowState = (): FlowStateContextType => {
  const context = useContext(FlowStateContext);
  if (context === undefined) {
    throw new Error('useFlowState must be used within a FlowStateProvider');
  }
  return context;
};
