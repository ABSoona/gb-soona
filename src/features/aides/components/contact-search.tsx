import { useState, useEffect, useRef } from 'react';
import { useContactSearch } from '@/api/contact/contact-service';
import { Combobox } from '@/components/ui/combobox';
import { X } from 'lucide-react'; // Icône pour supprimer la sélection
import { Badge } from '@/components/ui/badge'; // Badge stylisé

interface ContactSearchComboboxProps {
  onSelect: (contactId: number | null) => void;
  defaultContact?: { id: number; nom: string; prenom: string};
}

export function ContactSearchCombobox({ onSelect, defaultContact }: ContactSearchComboboxProps) {
  const [search, setSearch] = useState('');
  const { contacts, loading } = useContactSearch(search);
  const [selectedContact, setSelectedContact] = useState(defaultContact || null);
  const hasSelectedManually = useRef(false);
  const hasClearedManually = useRef(false); // ✅ Empêche le useEffect de réappliquer defaultContact

  // 🔥 Mise à jour lorsqu'on ouvre une aide en mode édition (sauf si suppression manuelle)
  useEffect(() => {
    if (defaultContact && !hasSelectedManually.current && !hasClearedManually.current) {
      console.log('🔄 Mise à jour depuis `defaultContact`:', defaultContact.id);
      setSelectedContact(defaultContact);
      onSelect(defaultContact.id);
    }
  }, [defaultContact]);

  // 🔥 Fonction pour supprimer la sélection
  const handleRemoveContact = () => {
    setSelectedContact(null);
    onSelect(null);
    setSearch('');
    hasClearedManually.current = true; // ✅ Bloque la réinitialisation du useEffect
  };

  return (
    <div className="relative">
      {selectedContact ? (
        // ✅ Affichage du contact sous forme de badge
        <div className="flex items-center justify-between capitalize rounded-md bg-gray-100 px-3 py-2 text-sm shadow-sm">
          <Badge variant="secondary" className="flex items-center bg-primary gap-2 text-white hover:bg-primary">
            {selectedContact.nom} {selectedContact.prenom} - N° {selectedContact.id}
            <button onClick={handleRemoveContact} className="ml-2  hover:text-red-600">
              <X size={14} />
            </button>
          </Badge>
        </div>
      ) : (
        // ✅ Input de recherche si aucun contact n'est sélectionné
        <Combobox 
          value={search}
          onValueChange={(contactId) => {
            const contact = contacts.find((c: { id: number; }) => c.id === Number(contactId));
            if (contact) {
              console.log('🆕 Nouveau contact sélectionné :', contact.id);
              hasSelectedManually.current = true;
              hasClearedManually.current = false; // ✅ Réactive la mise à jour de `defaultContact`
              setSelectedContact(contact);
              onSelect(contact.id);
            }
          }}
          items={contacts.map((contact: { id: { toString: () => any; }; nom: any; prenom: any;email:string;telephone:string }) => ({
            value: contact.id.toString(),
            label: `${contact.nom} ${contact.prenom} - N° ${contact.id}`,
            label2 :` ${contact.telephone}`,
            label3 :` ${contact.email}`
          }))}
          placeholder="Rechercher un contact..."
          isLoading={loading}
          onInputChange={(e) => setSearch(e.target.value)}
        />
      )}
    </div>
  );
}
