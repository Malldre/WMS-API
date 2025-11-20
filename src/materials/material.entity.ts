export class Material {
  id: number;
  uuid: string;
  externalCode: string;
  categoryId: number;
  description: string;
  materialUnit: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DEVELOPMENT';
  createdAt: Date;
}