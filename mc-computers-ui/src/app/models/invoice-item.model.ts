export interface InvoiceItem {
    id: string; // Guid
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}