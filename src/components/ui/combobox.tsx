import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

interface ComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string, label2: string, label3: string }[];
  placeholder?: string;
  isLoading?: boolean;
  onInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Combobox({
  value,
  onValueChange,
  items,
  placeholder = 'Sélectionner...',
  isLoading = false,
  onInputChange,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Champ de saisie */}
      <Input
        value={value} // 🔥 Assure que l'input reçoit bien la valeur
        onChange={onInputChange}
        placeholder={placeholder}
        className="w-full rounded-md border px-3 py-2  shadow-sm"
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />

      {/* Liste déroulante */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
          <ScrollArea className="max-h-60 overflow-auto">
            {isLoading ? (
              <p className="p-2 text-sm text-gray-500">Chargement...</p>
            ) : items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.value}
                  className="w-full px-3 py-2 text-left text-black hover:bg-muted cursor-pointer transition-all duration-150 rounded-md"
                  onClick={() => {
                    onValueChange(item.value);
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col group transition-all duration-150">
                    <div className="text-sm capitalize font-medium group-hover:text-base">
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground group-hover:text-sm">
                      {item.label2}
                    </div>
                    <div className="text-xs text-muted-foreground group-hover:text-sm">
                      {item.label3}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-2 text-sm text-gray-500">Aucun résultat</p>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
