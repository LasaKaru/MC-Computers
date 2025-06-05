import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InvoiceCreateModel } from '../models/invoice-create.model';
import { Invoice } from '../models/invoice.model'; 

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'https://localhost:7133/api/invoices'; // **ADJUST PORT if different**
                                                          // Find your API's HTTPS port from launchSettings.json (MCComputers.API/Properties/launchSettings.json)
                                                          // Example: "MCComputers.API": { "applicationUrl": "https://localhost:7123;http://localhost:5123" }

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  createInvoice(invoiceData: InvoiceCreateModel): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoiceData, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  getInvoiceById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }


  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      if (error.status === 400 && error.error && typeof error.error === 'object') {
        // Handle ASP.NET Core validation errors
        const errors = error.error.errors || error.error;
        let modelStateErrors = '';
        for (const key in errors) {
          if (errors[key]) {
            modelStateErrors += `${key}: ${errors[key].join ? errors[key].join(' ') : errors[key]}\n`;
          }
        }
        errorMessage = `Validation Failed:\n${modelStateErrors || error.statusText }`;
      } else {
        errorMessage = `Server returned code ${error.status}, error message is: ${error.message || error.statusText}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}