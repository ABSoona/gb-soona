import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { ResetPasswordForm } from './components/reset-password-form'

export default function ResetPassword() {
  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='mb-2 flex flex-col space-y-2 text-left'>
          <h1 className='text-lg font-semibold tracking-tight'>
            Crérer votre compte
          </h1>
          <p className='text-sm text-muted-foreground'>
           completer le formualire  pour créer un compte. <br />
           Vous avez déja un compte?{' '}
            <Link
              to='/sign-in'
              className='underline underline-offset-4 hover:text-primary'
            >
              Se connecter
            </Link>
          </p>
        </div>
        <ResetPasswordForm />
        
      </Card>
    </AuthLayout> 
  )
}
