import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';

// Import jsPDF and autoTable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule
  ],
  providers: [DatePipe], 
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  selectedInvoiceId: string | null = null; 

  constructor(
    private invoiceService: InvoiceService,
    private datePipe: DatePipe 
  ) { }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.selectedInvoiceId = null;
    this.errorMessage = null;
    this.invoiceService.getInvoices().subscribe({
      next: (data) => {
        this.invoices = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = `Error loading invoices: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  previewPdf(invoiceId: string): void {
    this.isLoading = true;
    this.selectedInvoiceId = invoiceId;
    this.errorMessage = null;

    this.invoiceService.getInvoiceById(invoiceId).subscribe({
      next: (invoiceDetails) => {
        if (invoiceDetails) {
          this.generatePdf(invoiceDetails); 
        } else {
          this.errorMessage = `Could not find details for invoice ID: ${invoiceId}`;
        }
        this.isLoading = false;
        this.selectedInvoiceId = null;
      },
      error: (err) => {
        this.errorMessage = `Error fetching invoice details for PDF: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.selectedInvoiceId = null;
        console.error(err);
      }
    });
  }

  generatePdf(invoice: Invoice): void {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    let currentY = 20;

    doc.setFontSize(20);
    doc.text('Invoice', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;

    doc.setFontSize(10);
    doc.text('MC Computers', 20, currentY);
    currentY += 5;
    doc.text('123 Tech Street, Silicon Valley, CA 94000', 20, currentY);
    currentY += 15;

    doc.setFontSize(12);
    doc.text(`Invoice ID: ${invoice.id.substring(0,18)}...`, 20, currentY);
    doc.text(`Transaction Date: ${this.datePipe.transform(invoice.transactionDate, 'mediumDate')}`, pageWidth - 20, currentY, { align: 'right' });
    currentY += 10;

    const head = [['Product Name', 'Quantity', 'Unit Price', 'Line Total']];
    const body = invoice.invoiceItems.map(item => [
      item.productName,
      item.quantity.toString(),
      `$${item.unitPrice.toFixed(2)}`,
      `$${item.lineTotal.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: head,
      body: body,
      theme: 'striped',
      headStyles: { fillColor: [44, 62, 80] },
       didDrawPage: (data) => {
        const str = "Page " + (doc.internal as any).getNumberOfPages()
        doc.setFontSize(10);
        doc.text(str, data.settings.margin.left, pageHeight - 10);
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(12);
    const subtotalForPdf = invoice.invoiceItems.reduce((sum, item) => sum + item.lineTotal, 0);
    doc.text(`Subtotal: $${subtotalForPdf.toFixed(2)}`, pageWidth - 20, currentY, { align: 'right' });
    currentY += 7;
    doc.text(`Discount: $${invoice.discount.toFixed(2)}`, pageWidth - 20, currentY, { align: 'right' });
    currentY += 7;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount: $${invoice.totalAmount.toFixed(2)}`, pageWidth - 20, currentY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    currentY += 10;
    doc.setFontSize(12);
    doc.text(`Balance Due: $${invoice.balanceAmount.toFixed(2)}`, pageWidth - 20, currentY, { align: 'right' });
    doc.save(`Invoice-${invoice.id.substring(0,8)}.pdf`);
  }
}