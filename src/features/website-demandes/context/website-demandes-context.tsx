import { WebsiteDemande } from '@/model/website-demandes/website-demandes.ts';
import { createContext, useContext, useState } from 'react';
export type WebsiteDemandeDialogType = 'add' | 'edit' | 'delete' | 'view' | null;

interface WebsiteDemandesContextType {
  openDemande: WebsiteDemandeDialogType;
  setOpenDemande: (type: WebsiteDemandeDialogType) => void;
  currentRow: WebsiteDemande | null;
  setCurrentRow: (row: WebsiteDemande | null) => void;
  triggerRefetchWebsiteDemandes: () => void;
}

const WebsiteDemandesContext = createContext<WebsiteDemandesContextType | undefined>(undefined);

export function WebsiteDemandesProvider({ children }: { children: React.ReactNode }) {
  const [openDemande, setOpenDemande] = useState<WebsiteDemandeDialogType>(null);
  const [currentRow, setCurrentRow] = useState<WebsiteDemande | null>(null);

  const triggerRefetchWebsiteDemandes = () => {
    // Implémentation custom si besoin d'un refetch global
    console.log('🔁 Demandes refetch triggered');
  };

  return (
    <WebsiteDemandesContext.Provider
      value={{ openDemande, setOpenDemande, currentRow, setCurrentRow, triggerRefetchWebsiteDemandes }}
    >
      {children}
    </WebsiteDemandesContext.Provider>
  );
}

export const useWebsiteDemandes = () => {
  const context = useContext(WebsiteDemandesContext);
  if (!context) {
    throw new Error('useWebsiteDemandes must be used within a WebsiteDemandesProvider');
  }
  return context;
};
