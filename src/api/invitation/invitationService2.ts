import axiosInstance from '@/lib/axtios-instance'; 
import { Invitation } from '@/model/invitation/Invitation';

export const getInvitationWithToken = async (token: string): Promise<Invitation> => {
  const response = await axiosInstance.get<Invitation>(`/invitations/by-token?token=${encodeURIComponent(token)}`);
  return response.data;
};