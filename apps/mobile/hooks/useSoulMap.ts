import { useQuery } from '@tanstack/react-query';
import type { SoulMapMetadata } from '@veil/shared';
import { api } from '../lib/api';

export function useSoulMap() {
  return useQuery({
    queryKey: ['soul-map'],
    queryFn: async () => {
      const result = await api.getMySoulMap();
      return (result.data || null) as SoulMapMetadata | null;
    },
  });
}
