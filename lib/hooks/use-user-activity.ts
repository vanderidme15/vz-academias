import { useEffect, useState } from 'react';
import { useAuditStore } from '../store/audit.store';
import { InscripcionAudit } from '@/shared/types/supabase.types';

export function useUserActivity(userId: string, limit = 50) {
  const [activity, setActivity] = useState<InscripcionAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const { getUserActivity } = useAuditStore();

  useEffect(() => {
    async function loadActivity() {
      setLoading(true);
      const data = await getUserActivity(userId, limit);
      setActivity(data);
      setLoading(false);
    }

    if (userId) {
      loadActivity();
    }
  }, [userId, limit, getUserActivity]);

  return { activity, loading };
}