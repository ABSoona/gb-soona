import { Contact } from "../contact/Contact";

export type Visite = {
  contact?: Contact | null;
  createdAt: Date;
  id: string;
  updatedAt: Date;
};
