import { create } from 'zustand';
import type { DailyPrompt } from '../lib/types';

interface PromptState {
  todayPrompt: DailyPrompt | null;
  responseText: string;
  hasResponded: boolean;
  setTodayPrompt: (prompt: DailyPrompt) => void;
  setResponseText: (text: string) => void;
  markResponded: () => void;
}

export const usePromptStore = create<PromptState>((set) => ({
  todayPrompt: null,
  responseText: '',
  hasResponded: false,
  setTodayPrompt: (prompt) => set({ todayPrompt: prompt, hasResponded: prompt.user_has_responded }),
  setResponseText: (responseText) => set({ responseText }),
  markResponded: () => set({ hasResponded: true }),
}));
