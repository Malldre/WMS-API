export class Company {
  id: number;
  uuid: string;
  cnpj: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  street: string;
  city: string;
  state: string;
  postalCode: string | null;
  country: string;
  createdById: number;
  changedById: number | null;
  deletedById: number | null;
  createdAt: Date;
  changedAt: Date | null;
  deletedAt: Date | null;
}