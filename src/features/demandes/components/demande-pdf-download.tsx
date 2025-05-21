import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { downloadDemande, downloadFicheVisitePdf } from '@/api/demande/demandeService';
export default function DemandeDownload() {
  const id = useParams({
    from: '/_authenticated/demandes/$id/pdf',
    select: (params) => params?.id, 
  });


  const navigate = useNavigate();
  const hasDownloaded = useRef(false);

  useEffect(() => {
    if (!id || hasDownloaded.current) return;
    hasDownloaded.current = true;

    downloadDemande(Number(id))
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

  return <p>📄 Téléchargement de la demande...</p>;
}
