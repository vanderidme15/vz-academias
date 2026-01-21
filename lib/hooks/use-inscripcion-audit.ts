import { useEffect, useState } from 'react';
import { useAuditStore } from '../store/audit.store';
import { InscripcionAudit } from '@/shared/types/supabase.types';

export function useInscripcionAudit(inscripcionId: string) {
  const [history, setHistory] = useState<InscripcionAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const { getInscripcionHistory } = useAuditStore();

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      const data = await getInscripcionHistory(inscripcionId);
      setHistory(data);
      setLoading(false);
    }

    if (inscripcionId) {
      loadHistory();
    }
  }, [inscripcionId, getInscripcionHistory]);

  return { history, loading };
}