'use client'

import { SelectDropdown } from "@/components/select-dropdown"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { telegramSuggestion, telegramSuggestOptions } from "./telegram-utils"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { useForm } from "react-hook-form"
import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"


export const telegramFormSchema = z.object({
  recommandation: z.enum(["accept", "reject"], {
    required_error: "La recommandation est obligatoire",
  }),
  message: z
    .string()
    .min(1, "Le message est obligatoire"),
  authoriseVote: z.boolean(),
})

export type TelegramFormValues = z.infer<typeof telegramFormSchema>
interface TelegramSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    message: string
    authoriseVote: boolean
    recommandation: telegramSuggestion
  }) => Promise<void>
}


export const TelegramSheet: React.FC<TelegramSheetProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const form = useForm<TelegramFormValues>({
    resolver: zodResolver(telegramFormSchema),
    defaultValues: {
      authoriseVote: true,
      message: "",
      recommandation: undefined,
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (values: TelegramFormValues) => {
    try {
      setIsSubmitting(true)

      await onSubmit({
        message: values.message,
        authoriseVote: values.authoriseVote,
        recommandation: values.recommandation,
      })

      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Erreur lors de l'envoi Telegram", error)
      toast({
        title: "Erreur",
        description: "Impossible d’envoyer le message au comité",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="space-y-4 p-6">
        <SheetHeader>
          <SheetTitle>Soumettre au comité Telegram</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Switch vote */}
            <FormField
              control={form.control}
              name="authoriseVote"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Ajouter les boutons de vote</FormLabel>
                </FormItem>
              )}
            />

            {/* Select recommandation */}
            <FormField
              control={form.control}
              name="recommandation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recommandation de L'AS</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as telegramSuggestion)
                      }
                      placeholder="Choisir un option"
                      items={[...telegramSuggestOptions]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observations</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={15}
                      placeholder="Recommandations / Observations"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Enregistrement..." : "Soumettre"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
