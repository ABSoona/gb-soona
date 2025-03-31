import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export default function SignIn() {
  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='flex flex-col space-y-2 text-left'>
          <h1 className='text-2xl font-semibold tracking-tight'>Connexion</h1>
          <p className='text-sm text-muted-foreground'>
           Entrez votre email et mot de passe pour accéder<br />
          à votre compte
          </p>
        </div>
        <UserAuthForm />
       
      </Card>
    </AuthLayout>
  )
}
