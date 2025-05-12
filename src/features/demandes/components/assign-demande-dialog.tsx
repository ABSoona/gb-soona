'use client';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { UserSearchCombobox } from "@/features/users/components/user-search";
import { useState } from "react";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from '@/components/ui/textarea';


interface AssignDemandeSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: { userId: string; message: string; }) => Promise<void>;
}

const formSchema = z.object({ userId: z.string(), message: z.string().optional() })


export const AssignDemandeSheet: React.FC<AssignDemandeSheetProps> = ({
    open,
    onOpenChange,
    onSubmit,
}) => {
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    type shareFicheForm = z.infer<typeof formSchema>;
    const form = useForm<shareFicheForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userId: '',

        },
    });



    const handleSubmit = async (sendMail: boolean) => {

        setIsSubmitting(true);
         await onSubmit({ userId, message });
        setIsSubmitting(false);
        onOpenChange(false);

        setMessage("");
    };
    const userId = form.watch('userId');
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="space-y-4 p-6">
                <FormProvider {...form}>
                    <SheetHeader>
                        <SheetTitle>Affecter la demande</SheetTitle>
                        <SheetDescription>
                            Affecter le traitement de la demande à un collègue
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4">

                        <FormField
                            control={form.control}
                            name="userId"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel>Utilisateur</FormLabel>
                                    <FormControl>
                                        <UserSearchCombobox
                                            onSelect={(userId) => {
                                                field.onChange(userId);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Textarea
                            placeholder="Votre message (Optionel)"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <SheetFooter className="pt-4 flex justify-end gap-2">
                        
                        <Button
                            onClick={() => handleSubmit(true)}
                            disabled={!userId || isSubmitting}
                        >
                            {isSubmitting ? "Affectation en cours..." : "Affecter"}
                        </Button>
                    </SheetFooter>
                </FormProvider>
            </SheetContent>
        </Sheet>
    );
};
