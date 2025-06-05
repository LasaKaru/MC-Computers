import { InvoiceItemCreateModel } from './invoice-item-create.model';

export interface InvoiceCreateModel {
  transactionDate: string; 
  discount: number;
  invoiceItems: InvoiceItemCreateModel[];
}