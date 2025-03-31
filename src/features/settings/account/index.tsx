import ContentSection from '../components/content-section'
import { UserForm } from './account-form'

export default function SettingsAccount() {
  return (
    <ContentSection
      title='Mon compte'
      desc='Mettez à jour les paramètres de votre compte. Définissez votre langue et votre mot de passe.'
    >
      <UserForm />
    </ContentSection>
  )
}
