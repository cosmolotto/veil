import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { usePromptStore } from '../stores/promptStore';

export function useTodayPrompt() {
  const { todayPrompt, hasResponded, setTodayPrompt } = usePromptStore();

  const query = useQuery({
    queryKey: ['today-prompt'],
    queryFn: () => api.getTodayPrompt(),
  });

  useEffect(() => {
    if (query.data?.data) {
      setTodayPrompt(query.data.data);
    }
  }, [query.data, setTodayPrompt]);

  useEffect(() => {
    if (!query.error || todayPrompt) return;

    setTodayPrompt({
      date: new Date().toISOString().split('T')[0],
      user_has_responded: false,
      prompt: {
        id: 'demo-prompt',
        text: 'What truth about you deserves more room today?',
        category: 'identity',
        difficulty_level: 3,
        created_at: new Date().toISOString(),
      },
    });
  }, [query.error, todayPrompt, setTodayPrompt]);

  return {
    todayPrompt,
    hasResponded,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
