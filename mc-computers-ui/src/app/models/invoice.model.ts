import { InvoiceItem } from "./invoice-item.model";

export interface Invoice {
    id: string; 
    transactionDate: string; 
    discount: number;
    totalAmount: number;
    balanceAmount: number;
    invoiceItems: InvoiceItem[];
}