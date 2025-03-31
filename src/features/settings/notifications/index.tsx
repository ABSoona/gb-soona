import ContentSection from '../components/content-section'
import { NotificationsForm } from './notifications-form'

export default function SettingsNotifications() {
  return (
    <ContentSection
      title='Notifications'
      desc='Configurez la manière dont vous recevez les notifications.'
    >
      <NotificationsForm />
    </ContentSection>
 
  )
}
