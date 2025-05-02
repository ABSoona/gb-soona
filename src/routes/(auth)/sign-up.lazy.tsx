import SignUp from '@/features/auth/sign-up'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/(auth)/sign-up')({
  component: SignUp,
})
