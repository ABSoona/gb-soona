import { telegramSuggestion } from '@/features/demandes/components/telegram-utils';
import axiosInstance from '@/lib/axtios-instance';



export const telegramPublish = async (payload: { 
    demandeId: number,
    title: string,
    lines: string[],
    demandeUrl: string,
    authoriseVote: boolean,
    recommandation: telegramSuggestion,
    message:string }): Promise<void> => {
    await axiosInstance.post(`/telegram/publish`, payload);
};


