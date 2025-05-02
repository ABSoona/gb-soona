import { gql } from '@apollo/client';

import { USERNOTIFICATIONPREFERENCE_FIELDS } from './fragment';

export const GET_USERNOTIFICATIONPREFERENCES = gql`
  query GetUserNotificationPreferences($skip: Float, $take: Float, $where : UserNotificationPreferenceWhereInput) {
    userNotificationPreferences(skip: $skip, take: $take, where: $where, orderBy:[{ createdAt: Asc }]) {
      ...UserNotificationPreferenceFields
      
    }
  }

  ${USERNOTIFICATIONPREFERENCE_FIELDS}
`;

// 🔥 Ajout des mutations
export const CREATE_USERNOTIFICATIONPREFERENCE = gql`
  mutation CreateUserNotificationPreference($data: UserNotificationPreferenceCreateInput!) {
    createUserNotificationPreference(data: $data) {
      ...UserNotificationPreferenceFields
    }
  }
  ${USERNOTIFICATIONPREFERENCE_FIELDS}

`;

export const UPDATE_USERNOTIFICATIONPREFERENCE = gql`
  mutation UpdateUserNotificationPreference($id: Float! , $data: UserNotificationPreferenceUpdateInput!) {
    updateUserNotificationPreference(where: {id : $id}, data: $data) {
      ...UserNotificationPreferenceFields
    }
  }
  ${USERNOTIFICATIONPREFERENCE_FIELDS}

`;




export const DELETE_USERNOTIFICATIONPREFERENCE = gql`
  mutation DeleteUserNotificationPreference($id: Float!) {
    deleteUserNotificationPreference(where: { id: $id }) {
      __typename
    }
  }
 
`;







