import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { downloadFicheVisitePdf } from '@/api/demande/demandeService';
export default function FicheVisiteDownload() {
  const id = useParams({
    from: '/(auth)/demandes/$id/fiche-visite-pdf',
    select: (params) => params?.id, 
  });
  const { token } = useSearch({
    from: '/(auth)/demandes/$id/fiche-visite-pdf',
  });

  const navigate = useNavigate();
  const hasDownloaded = useRef(false);

  useEffect(() => {
    if (!id || hasDownloaded.current) return;
    hasDownloaded.current = true;

    downloadFicheVisitePdf(Number(id),token)
      .catch((err) => {
        alert('Erreur : impossible de télécharger le PDF.');
        console.error(err);
      })
      .finally(() => {
        // ✅ Redirection après téléchargement (2s pour lisibilité)
        setTimeout(() => {
          navigate({ to: `/demandes/${id}/` });
        }, 2000);
      });
  }, [id, navigate]);

  return <p>📄 Téléchargement de la fiche de visite en cours...</p>;
}
