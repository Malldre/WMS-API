export class Invoice {
  id: number;
  uuid: string;
  invoiceNumber: string;
  supplierId: number;
  receivedAt: Date;
  status: 'PENDING' | 'RECEIVED' | 'REJECTED' | 'CANCELLED' | 'WAITING_INSPECTION';
  createdById: number;
  changedById: number | null;
  deletedById: number | null;
  createdAt: Date;
  changedAt: Date | null;
  deletedAt: Date | null;
}