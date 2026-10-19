import { DecisionType } from '@/model/decision/Decision'

export const decisionTypeLabels: Record<DecisionType, string> = {
  Approbation: 'Approuvee',
  Refus: 'Refusee',
  Ajournement: 'Ajournee',
}

export const decisionTypeColor: Record<DecisionType, string> = {
  Approbation: 'bg-teal-100/50 text-teal-900 dark:text-teal-200 border-teal-200',
  Refus: 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  Ajournement: 'bg-yellow-100/50 text-yellow-900 dark:text-yellow-200 border-yellow-200',
}
