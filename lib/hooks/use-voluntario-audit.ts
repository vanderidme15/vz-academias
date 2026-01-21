import { useEffect, useState } from 'react';
import { useAuditStore } from '../store/audit.store';
import { VoluntarioAudit } from '@/shared/types/supabase.types';

export function useVoluntarioAudit(voluntarioId: string) {
  const [history, setHistory] = useState<VoluntarioAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const { getVoluntarioHistory } = useAuditStore();

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      const data = await getVoluntarioHistory(voluntarioId);
      setHistory(data);
      setLoading(false);
    }

    if (voluntarioId) {
      loadHistory();
    }
  }, [voluntarioId, getVoluntarioHistory]);

  return { history, loading };
}