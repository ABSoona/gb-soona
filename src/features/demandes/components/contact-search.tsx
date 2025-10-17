import { useContactSearch } from '@/api/contact/contact-service';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Combobox } from '@/components/ui/combobox';
import { Contact } from '@/model/contact/Contact';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ContactSearchComboboxProps {
  onSelect: (contactId: number | null) => void;
  defaultContact?: {
    id: number;
    nom: string;
    prenom: string;
    telephone?: string;
    email?: string;
  };
}

export function ContactSearchCombobox({
  onSelect,
  defaultContact,
}: ContactSearchComboboxProps) {
  const [search, setSearch] = useState('');
  const { contacts, loading } = useContactSearch(search);
  const [selectedContact, setSelectedContact] = useState(defaultContact || null);
  const hasSelectedManually = useRef(false);
  const hasClearedManually = useRef(false);

  useEffect(() => {
    if (defaultContact && !hasSelectedManually.current && !hasClearedManually.current) {
      setSelectedContact(defaultContact);
      onSelect(defaultContact.id);
    }
  }, [defaultContact]);

  const handleRemoveContact = () => {
    setSelectedContact(null);
    onSelect(null);
    setSearch('');
    hasClearedManually.current = true;
  };

  return (
    <div className="relative">
      {selectedContact ? (
        <div className="flex items-center gap-3 rounded-md border px-3 py-2 shadow-sm bg-white">
          <Avatar>
            <AvatarFallback>
              {selectedContact.nom?.charAt(0)}
              {selectedContact.prenom?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">
              {selectedContact.nom} {selectedContact.prenom}
            </p>
            {selectedContact.telephone && (
              <p className="text-xs text-muted-foreground">{selectedContact.telephone}</p>
            )}
            {selectedContact.email && (
              <p className="text-xs text-muted-foreground">{selectedContact.email}</p>
            )}
          </div>
          <button onClick={handleRemoveContact} className="ml-auto hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      ) : (
        <Combobox
          value={search}
          onValueChange={(contactId) => {
            const contact = contacts.find((c:Contact) => c.id === Number(contactId));
            if (contact) {
              hasSelectedManually.current = true;
              hasClearedManually.current = false;
              setSelectedContact(contact);
              onSelect(contact.id);
            }
          }}
          onInputChange={(e) => setSearch(e.target.value)}
          items={contacts.map((contact:Contact) => ({
            value: contact.id.toString(),
            label: (
              <div className="flex items-center gap-3 group">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>
                    {contact.nom?.charAt(0)}
                    {contact.prenom?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col transition-all duration-150">
                  <span className="font-medium text-sm group-hover:text-base">
                    {contact.nom} {contact.prenom}
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-sm">
                    {contact.telephone}
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-sm">
                    {contact.email}
                  </span>
                </div>
              </div>
            )
          }))}
          placeholder="Rechercher un bénéficiaire..."
          isLoading={loading}
        />
      )}
    </div>
  );
}
