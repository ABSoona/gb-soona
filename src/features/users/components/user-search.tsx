import { useUsersSearch } from '@/api/user/userService.v2';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge'; // Badge stylisé
import { Combobox } from '@/components/ui/combobox';
import { User } from '@/model/user/User';
import { X } from 'lucide-react'; // Icône pour supprimer la sélection
import { useEffect, useRef, useState } from 'react';

interface UserSearchComboboxProps {
  onSelect: (userId: string | null) => void;
  defaultUser?: User;
}

export function UserSearchCombobox({ onSelect, defaultUser }: UserSearchComboboxProps) {
  const [search, setSearch] = useState('');
  const { users, loading } = useUsersSearch(search);
  const [selectedUser, setSelectedUser] = useState(defaultUser || null);
  const hasSelectedManually = useRef(false);
  const hasClearedManually = useRef(false); // ✅ Empêche le useEffect de réappliquer defaultUser

  // 🔥 Mise à jour lorsqu'on ouvre une demande en mode édition (sauf si suppression manuelle)
  useEffect(() => {
    if (defaultUser && !hasSelectedManually.current && !hasClearedManually.current) {
      console.log('🔄 Mise à jour depuis `defaultUser`:', defaultUser.id);
      setSelectedUser(defaultUser);
      onSelect(defaultUser.id);
    }
  }, [defaultUser]);

  // 🔥 Fonction pour supprimer la sélection
  const handleRemoveUser = () => {
    setSelectedUser(null);
    onSelect(null);
    setSearch('');
    hasClearedManually.current = true; // ✅ Bloque la réinitialisation du useEffect
  };
    // ✅✅ AJOUTE CES LOGS ICI POUR DEBUG
    console.log("🔍 search:", search);
    console.log("📦 users from API:", users);
    console.log("📦 combobox items:", users.map((user:User) => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName} - N° ${user.email}`,
    })));
  return (
    <div className="relative">
      {selectedUser ? (
        // ✅ Affichage du user sous forme de badge
        <div className="flex items-center gap-3 rounded-md border px-3 py-2 shadow-sm bg-white">
  <Avatar>
    <AvatarFallback>
      {selectedUser.firstName?.charAt(0)}
      {selectedUser.lastName?.charAt(0)}
    </AvatarFallback>
  </Avatar>
  <div className="flex-1">
    <p className="font-medium">
      {selectedUser.firstName} {selectedUser.lastName}
    </p>
    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
  </div>
  <button onClick={handleRemoveUser} className="ml-2 hover:text-red-600">
    <X size={16} />
  </button>
</div>
      ) : (
        // ✅ Input de recherche si aucun user n'est sélectionné
        <Combobox
          value={search}
          onValueChange={(userId) => {
            const user:User = users.find((c: { id: string; }) => c.id === userId);
            if (user) {
              console.log('🆕 Nouveau user sélectionné :', user.id);
              hasSelectedManually.current = true;
              hasClearedManually.current = false; // ✅ Réactive la mise à jour de `defaultUser`
              setSelectedUser(user);
              onSelect(user.id);
            }
          }}
          items={users.map((user: User) => ({
            value: user.id,
            label: (
              <div className="flex items-center gap-3 bg-transparent">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>
                    {user.firstName?.charAt(0)}
                    {user.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            )
          }))}
          placeholder="Rechercher un collègue..."
          isLoading={loading}
          onInputChange={(e) => setSearch(e.target.value)}
        />
      )}
    </div>
  );
}
