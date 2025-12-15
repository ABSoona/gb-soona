import axiosInstance from '@/lib/axtios-instance';
import { getUserId } from '@/lib/session';
import { User } from '@/model/user/User';


export const telegramPublish = async (payload : {demandeId: number, title: string, lines : string[],demandeUrl:string,authorizeVote:boolean}): Promise<void> => {
  await axiosInstance.post(`/telegram/publish`, payload);
};


