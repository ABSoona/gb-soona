
import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { ForgotForm } from './components/forgot-password-form'

export default function ForgotPassword() {
  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='mb-2 flex flex-col space-y-2 text-left'>
          <h1 className='text-md font-semibold tracking-tight'>
            Mot de passe oublié
          </h1>
          <p className='text-sm text-muted-foreground'>
          Entre ton adresse e-mail enregistrée et nous t’enverrons un lien pour réinitialiser ton mot de passe.
          </p>
        </div>
        <ForgotForm />       
      </Card>
    </AuthLayout>
  )
}
