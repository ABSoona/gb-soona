import axiosInstance from '@/lib/axtios-instance';

export interface OrganizationSettings {
  nom: string;
  adresse: string;
  rna: string;
  email: string;
  telephone: string;
}

export async function getOrganizationSettings(): Promise<OrganizationSettings> {
  const response = await axiosInstance.get<OrganizationSettings>('/organization-settings');
  return response.data;
}

export async function updateOrganizationSettings(data: OrganizationSettings): Promise<OrganizationSettings> {
  const response = await axiosInstance.put<OrganizationSettings>('/organization-settings', data);
  return response.data;
}
