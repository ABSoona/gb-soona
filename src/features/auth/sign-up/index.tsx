import { Card } from '@/components/ui/card'
import { Link } from '@tanstack/react-router'
import AuthLayout from '../auth-layout'
import { SignUpForm } from './components/sign-up-form'

export default function SignUp() {
  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='mb-2 flex flex-col space-y-2 text-left'>
          <h1 className='text-lg font-semibold tracking-tight'>
            Créer votre compte
          </h1>
          <p className='text-sm text-muted-foreground'>
            Completer le formualaire pour créer un compte. <br />
            Vous avez déja un compte?{' '}
            <Link
              to='/sign-in'
              className='underline underline-offset-4 hover:text-primary'
            >
              Se connecter
            </Link>
          </p>
        </div>
        <SignUpForm />

      </Card>
    </AuthLayout>
  )
}
