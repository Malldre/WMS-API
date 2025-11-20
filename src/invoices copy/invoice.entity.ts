export class Invoice {
  id: number;
  uuid: string;
  invoiceNumber: string;
  supplierId: number;
  receivedAt: Date;
  status: 'PENDING' | 'RECEIVED' | 'REJECTED' | 'CANCELLED' | 'WAITING_INSPECTION';
  createdAt: Date;
}