import axios from 'axios';

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export interface PublicUploadTypeDocument {
  id: number;
  label: string;
  rattachement: string;
  description: string | null;
}

export interface PublicUploadInfo {
  contactNom: string | null;
  contactPrenom: string | null;
  demandeActive: boolean;
  typeDocuments: PublicUploadTypeDocument[];
}

export async function getPublicUploadInfo(token: string): Promise<PublicUploadInfo> {
  const response = await publicApi.get<PublicUploadInfo>('/documents/public-upload-info', {
    params: { token },
  });
  return response.data;
}

export async function uploadPublicDocument(
  token: string,
  typeDocumentId: number,
  file: File
): Promise<{ id: string }> {
  const formData = new FormData();
  formData.append('token', token);
  formData.append('typeDocumentId', typeDocumentId.toString());
  formData.append('file', file);

  const response = await publicApi.post<{ id: string }>('/documents/public-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
