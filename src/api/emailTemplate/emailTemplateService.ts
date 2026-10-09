import axiosInstance from '@/lib/axtios-instance';

export const EMAIL_TEMPLATE_CODE_DEMANDE_JUSTIFICATIFS = 'DEMANDE_JUSTIFICATIFS';

export interface EmailTemplate {
  code: string;
  objet: string;
  corps: string;
}

export async function getEmailTemplate(code: string): Promise<EmailTemplate> {
  const response = await axiosInstance.get<EmailTemplate>(`/email-templates/${code}`);
  return response.data;
}

export async function updateEmailTemplate(code: string, objet: string, corps: string): Promise<EmailTemplate> {
  const response = await axiosInstance.put<EmailTemplate>(`/email-templates/${code}`, { objet, corps });
  return response.data;
}
