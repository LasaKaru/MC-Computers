import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common'; 
import { InvoiceService } from '../../services/invoice.service';
import { InvoiceCreateModel } from '../../models/invoice-create.model';
import { Invoice } from '../../models/invoice.model'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [DatePipe],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  subTotal = 0;
  totalAmount = 0;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private datePipe: DatePipe
  ) {
    this.invoiceForm = this.fb.group({
      transactionDate: [new Date().toISOString().substring(0, 10), Validators.required],
      discount: [0, [Validators.required, Validators.min(0)]],
      invoiceItems: this.fb.array([], [Validators.required, Validators.minLength(1)])
    });
  }

  ngOnInit(): void {
    this.addInvoiceItem();
    this.invoiceForm.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }


  get invoiceItems(): FormArray {
    return this.invoiceForm.get('invoiceItems') as FormArray;
  }

  newInvoiceItem(): FormGroup {
    return this.fb.group({
      productName: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  addInvoiceItem(): void {
    this.invoiceItems.push(this.newInvoiceItem());
  }

  removeInvoiceItem(index: number): void {
    this.invoiceItems.removeAt(index);
  }

  getInvoiceItemControl(index: number, controlName: string): AbstractControl | null {
    return this.invoiceItems.at(index)?.get(controlName);
  }

  calculateTotals(): void {
    this.subTotal = 0;
    this.invoiceItems.controls.forEach(itemGroup => {
      const quantity = itemGroup.get('quantity')?.value || 0;
      const unitPrice = itemGroup.get('unitPrice')?.value || 0;
      this.subTotal += quantity * unitPrice;
    });
    const discount = this.invoiceForm.get('discount')?.value || 0;
    this.totalAmount = this.subTotal - discount;
    if (this.totalAmount < 0) this.totalAmount = 0;
  }


  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;
    if (this.invoiceForm.invalid) {
      this.errorMessage = "Please fill all required fields correctly.";
      this.invoiceForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.invoiceForm.value;

    const invoiceData: InvoiceCreateModel = {
      transactionDate: new Date(formValue.transactionDate).toISOString(),
      discount: parseFloat(formValue.discount),
      invoiceItems: formValue.invoiceItems.map((item: any) => ({
        productName: item.productName,
        quantity: parseInt(item.quantity, 10),
        unitPrice: parseFloat(item.unitPrice)
      }))
    };

    this.invoiceService.createInvoice(invoiceData).subscribe({
      next: (createdInvoice) => { 
        this.isLoading = false;
        this.successMessage = `Invoice created successfully! ID: ${createdInvoice.id}`;
        console.log('Invoice created:', createdInvoice);

        this.generatePdf(createdInvoice);

        this.invoiceForm.reset({
            transactionDate: new Date().toISOString().substring(0, 10),
            discount: 0
        });
        this.invoiceItems.clear();
        this.addInvoiceItem();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = `Error creating invoice: ${err.message || 'Unknown error'}`;
        console.error('Error creating invoice:', err);
      }
    });
  }

  generatePdf(invoice: Invoice): void {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    let currentY = 20; // Start Y position

    // Title
    doc.setFontSize(20);
    doc.text('Invoice', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;

    // Company Info (Optional)
    doc.setFontSize(10);
    doc.text('MC Computers', 20, currentY);
    currentY += 5;
    doc.text('No.01 , MC Street , Colombo02.', 20, currentY);
    currentY += 15;

    // Invoice Info
    doc.setFontSize(12);
    doc.text(`Invoice ID: ${invoice.id.substring(0,18)}...`, 20, currentY);
    doc.text(`Transaction Date: ${this.datePipe.transform(invoice.transactionDate, 'mediumDate')}`, pageWidth - 20, currentY, { align: 'right' });
    currentY += 10;

    // Table for Invoice Items
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

    // Get Y position after table
    currentY = (doc as any).lastAutoTable.finalY + 15; 

    // Totals Section
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

    // Balance Amount
    doc.setFontSize(12);
    doc.text(`Balance Due: $${invoice.balanceAmount.toFixed(2)}`, pageWidth - 20, currentY, { align: 'right' });


    // Save the PDF
    doc.save(`Invoice-${invoice.id.substring(0,8)}.pdf`);
  }
}