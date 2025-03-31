import { gql } from '@apollo/client';

export const USERNOTIFICATIONPREFERENCE_FIELDS = gql`
  fragment UserNotificationPreferenceFields on UserNotificationPreference {
    id
    typeField
    active
  }
`;
