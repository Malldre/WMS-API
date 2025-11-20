export class Supplier {
  id: number;
  uuid: string;
  companyId: number;
  company: {
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
    createdAt: Date;
  };
  createdAt: Date;
}