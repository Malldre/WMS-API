export class InvoiceItem {
  id: number;
  uuid: string;
  invoiceId: number;
  materialId: number;
  quantity: string;
  totalValue: string;
  unitValue: string;
  status: 'DIVERGENT' | 'CONFORMING' | 'COUNTING' | 'DAMAGED' | 'MISSING' | 'MISMATCHED' | 'WAITING';
  remark: string | null;
  createdById: number;
  changedById: number | null;
  deletedById: number | null;
  createdAt: Date;
  changedAt: Date | null;
  deletedAt: Date | null;
}