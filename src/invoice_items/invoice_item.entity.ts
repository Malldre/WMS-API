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
  createdAt: Date;
}