
import { supabase } from "@/integrations/supabase/client";
import { Task, Session, User, UserState, Intervention, PriorityLevel } from "@/types";
import { Json } from "@/integrations/supabase/types";

// Tasks Service
export const tasksService = {
  async getAll(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, sessions:sessions(*)')
      .eq('user_id', userId)
      .eq('completed', false);
    
    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
    
    return data.map(transformTaskFromDB) || [];
  },
  
  async getCompleted(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, sessions:sessions(*)')
      .eq('user_id', userId)
      .eq('completed', true);
    
    if (error) {
      console.error('Error fetching completed tasks:', error);
      throw error;
    }
    
    return data.map(transformTaskFromDB) || [];
  },
  
  async create(task: Omit<Task, 'id' | 'sessions'>, userId: string): Promise<Task> {
    const taskToInsert = {
      user_id: userId,
      title: task.title,
      description: task.description || null,
      priority: task.priority,
      due_date: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      created_at: new Date().toISOString(),
      completed: false
    };
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskToInsert)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }
    
    return transformTaskFromDB({...data, sessions: []});
  },
  
  async update(task: Task): Promise<Task> {
    const taskToUpdate = {
      title: task.title,
      description: task.description || null,
      priority: task.priority,
      due_date: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      completed: task.completed
    };
    
    const { data, error } = await supabase
      .from('tasks')
      .update(taskToUpdate)
      .eq('id', task.id)
      .select('*, sessions:sessions(*)')
      .single();
    
    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }
    
    return transformTaskFromDB(data);
  },
  
  async delete(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    
    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
};

// Sessions Service
export const sessionsService = {
  async startSession(taskId: string, userId: string, state: UserState, intervention?: Intervention): Promise<Session> {
    // Convert complex objects to JSON-compatible format
    const sessionToInsert = {
      task_id: taskId,
      user_id: userId,
      start_time: new Date().toISOString(),
      state: state as unknown as Json,
      completed: false,
      selected_intervention: intervention ? intervention as unknown as Json : null
    };
    
    const { data, error } = await supabase
      .from('sessions')
      .insert(sessionToInsert)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error starting session:', error);
      throw error;
    }
    
    return transformSessionFromDB(data);
  },
  
  async endSession(sessionId: string, feedback: Session['feedback']): Promise<Session> {
    const now = new Date();
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('start_time')
      .eq('id', sessionId)
      .single();
      
    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      throw sessionError;
    }
    
    const startTime = new Date(sessionData.start_time);
    const durationMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);
    
    const sessionToUpdate = {
      end_time: now.toISOString(),
      duration: durationMinutes,
      completed: true,
      feedback: feedback as unknown as Json
    };
    
    const { data, error } = await supabase
      .from('sessions')
      .update(sessionToUpdate)
      .eq('id', sessionId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error ending session:', error);
      throw error;
    }
    
    // Update user streak
    await updateUserStreak(data.user_id);
    
    return transformSessionFromDB(data);
  },
  
  async getSessionsByTaskId(taskId: string): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('task_id', taskId);
    
    if (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
    
    return data.map(transformSessionFromDB) || [];
  }
};

// User Streaks Service
export const userStreakService = {
  async getStreak(userId: string): Promise<{ count: number; lastActiveDate: Date }> {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No streak found, create one
        return this.initializeStreak(userId);
      }
      console.error('Error fetching user streak:', error);
      throw error;
    }
    
    return {
      count: data.count,
      lastActiveDate: new Date(data.last_active_date)
    };
  },
  
  async initializeStreak(userId: string): Promise<{ count: number; lastActiveDate: Date }> {
    const newStreak = {
      user_id: userId,
      count: 0,
      last_active_date: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('user_streaks')
      .insert(newStreak)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error initializing streak:', error);
      throw error;
    }
    
    return {
      count: data.count,
      lastActiveDate: new Date(data.last_active_date)
    };
  },
  
  async updateStreak(userId: string, count: number): Promise<void> {
    const { error } = await supabase
      .from('user_streaks')
      .update({
        count: count,
        last_active_date: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }
};

// Helper function to update user streak
async function updateUserStreak(userId: string): Promise<void> {
  try {
    const { data: userStreak, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No streak found, create one
        await userStreakService.initializeStreak(userId);
        return;
      }
      throw error;
    }
    
    const today = new Date().toDateString();
    const lastActiveDate = new Date(userStreak.last_active_date).toDateString();
    
    if (today !== lastActiveDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutiveDay = lastActiveDate === yesterday.toDateString();
      
      const newCount = isConsecutiveDay ? userStreak.count + 1 : 1;
      
      await userStreakService.updateStreak(userId, newCount);
    }
  } catch (error) {
    console.error('Error updating user streak:', error);
  }
}

// Helper functions to transform data
function transformTaskFromDB(dbTask: any): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || undefined,
    priority: dbTask.priority as PriorityLevel,
    dueDate: dbTask.due_date ? new Date(dbTask.due_date) : undefined,
    createdAt: new Date(dbTask.created_at),
    completed: dbTask.completed,
    sessions: Array.isArray(dbTask.sessions) 
      ? dbTask.sessions.map(transformSessionFromDB)
      : []
  };
}

function transformSessionFromDB(dbSession: any): Session {
  return {
    id: dbSession.id,
    taskId: dbSession.task_id,
    startTime: new Date(dbSession.start_time),
    endTime: dbSession.end_time ? new Date(dbSession.end_time) : undefined,
    duration: dbSession.duration || undefined,
    state: dbSession.state as UserState,
    completed: dbSession.completed,
    selectedIntervention: dbSession.selected_intervention as Intervention || undefined,
    feedback: dbSession.feedback as Session['feedback'] || undefined
  };
}
