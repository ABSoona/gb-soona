import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string , label2: string, label3: string}[];
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
        className="w-full rounded-md border px-3 py-2  shadow-sm capitalize"
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
                  className="w-full rounded-md justify-start bg-gray-100 text-black px-3 py-2 text-left hover:bg-gray-800 hover:bg-gray-400  hover:text-white cursor-pointer"
                  onClick={() => {
                    onValueChange(item.value);
                    setOpen(false);
                  }}
                >
                  <div className='cursor-pointer text-sm capitalize text-primary'>{item.label}</div>
                  <div className='cursor-pointer text-smtext-sm  text-primary'>{item.label2}</div>
                  <div className='cursor-pointer text-sm text-sm  text-primary'>{item.label3}</div>
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
