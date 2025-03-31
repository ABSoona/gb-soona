import ContentSection from '../components/content-section'
import { AppearanceForm } from './appearance-form'

export default function SettingsAppearance() {
  return (
    <ContentSection
      title='Apparence'
      desc='Personnalisez l’apparence de l’application. Basculez automatiquement entre les thèmes clair et sombre.'
    >
      <AppearanceForm />
    </ContentSection>
  )
}
