export class MaterialCategory {
  id: number;
  uuid: string;
  name: string;
  description: string;
  materialUnit: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
  createdAt: Date;
}