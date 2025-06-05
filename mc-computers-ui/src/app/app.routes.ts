import { Routes } from '@angular/router';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';

export const routes: Routes = [
  { path: 'create-invoice', component: InvoiceFormComponent },
  { path: 'invoices', component: InvoiceListComponent },
  { path: '', redirectTo: '/create-invoice', pathMatch: 'full' },
  { path: '**', redirectTo: '/create-invoice' } 
];