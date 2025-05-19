'use client';

import { useVersementService } from '@/api/versement/versementService';
import { useDemandeService } from '@/api/demande/demandeService';
import { SelectDropdown } from '@/components/select-dropdown';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { Versement,versementSchema } from '@/model/versement/versement';

import { z } from 'zod';



// 📌 Schéma de validation du formulaire avec Zod
const formSchema = versementSchema

type VersementForm = z.infer<typeof formSchema>;


interface Props {
  currentRow?: Versement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showContactSearch?: boolean;
  showDemandeSearch?: boolean;
  forContactId?: number;
  forDemandeId?: number;
}


export function VersementsActionDialog({ currentRow, open, onOpenChange, showContactSearch = true, showDemandeSearch = true, forContactId, forDemandeId }: Props) {


  
  return (
    <Sheet
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state);

       
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle></SheetTitle>
          <SheetDescription>
           
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full w-full py-1 pr-4">
          
          

        </ScrollArea>
        <SheetFooter>
      
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
