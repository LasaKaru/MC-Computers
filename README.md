# MC Computers Invoice System
![Screenshot 2025-06-05 204753](https://github.com/user-attachments/assets/99407b9f-00fb-4dff-a646-c6fbde9e77f9)
![Screenshot 2025-06-05 204949](https://github.com/user-attachments/assets/0efff6b0-89f8-4295-a9e3-3c4765866c07)

This project is a system for MC Computers to generate invoices for each transaction.
It's built with an Angular (Standalone Components) frontend, a .NET 8 Web API backend, and MS SQL Server as the database. The system supports saving invoices and generating PDF copies on the client-side.

## Tech Stack

* **Frontend:** Angular (v17+ with Standalone Components)
    * PDF Generation: `jsPDF`, `jspdf-autotable`
* **Backend:** .NET 8 API (C#)
* **Database:** MS SQL Server
* **Testing (Backend):** xUnit, Moq

## Prerequisites

Before setting up and running the application, ensure you have the following installed:

* .NET 8 SDK
* Node.js (LTS version recommended, e.g., v18 or v20) & npm
* Angular CLI (globally installed: `npm install -g @angular/cli`)
* SQL Server (Developer or Express Edition)
* SQL Server Management Studio (SSMS) or similar database tool
* Visual Studio 2022 (with ASP.NET and web development workload) or a code editor like VS Code.

## Setup and Running the Application

Follow these steps to get the MC Computers Invoice System up and running:

### 1. Backend (MCComputers.API)

1. **Database Setup:**
    * Open **SQL Server Management Studio (SSMS)** and connect to your SQL Server instance.
    * Create a new database named `MCComputersDB`.
    * Open `MCComputers.API/appsettings.json` (and `appsettings.Development.json`).
    * Update the `DefaultConnection` string in `ConnectionStrings` to point to your SQL Server instance and `MCComputersDB`.
        * Example: `"DefaultConnection": "Server=YOUR_SERVER_NAME;Database=MCComputersDB;Trusted_Connection=True;TrustServerCertificate=True;"`
        * (Replace `YOUR_SERVER_NAME` with your actual SQL Server instance name, such as `localhost`, `(localdb)\\mssqllocaldb`, or `YOURPCNAME\\SQLEXPRESS`).
2. **Open Solution/Project:**
    * Open the `MCComputersApp.sln` file in **Visual Studio 2022**, or open the `MCComputers.API` folder in your preferred code editor if not using the solution file.
3. **Restore NuGet Packages:**
    * If using Visual Studio, this should happen automatically. Otherwise, right-click the solution/project and choose "Restore NuGet Packages."
    * If using the .NET CLI: navigate to the `MCComputers.API` directory and run `dotnet restore`.
4. **Apply Migrations:**
    * **Using Visual Studio Package Manager Console:**
        * Ensure `MCComputers.API` is selected as the "Default project."
        * Run: `Update-Database`
    * **Using .NET CLI:**
        * Navigate to the `MCComputers.API` directory in your terminal.
        * Run: `dotnet ef database update`
5. **Run the API:**
    * **Using Visual Studio:**
        * Set `MCComputers.API` as the startup project.
        * Press F5 or click the "Start" button (usually shows "https").
    * **Using .NET CLI:**
        * Navigate to the `MCComputers.API` directory.
        * Run: `dotnet run`
    * The API will typically run on a port like `https://localhost:7XXX` or `http://localhost:5XXX`. Note the HTTPS port (e.g., `7123`). Swagger UI should be available at `/swagger`.
![Screenshot 2025-06-05 205810](https://github.com/user-attachments/assets/72041ad6-7b02-4834-9662-ccfdde441ebd)
![Screenshot 2025-06-05 205856](https://github.com/user-attachments/assets/1d3567c4-09fc-42ea-a2c9-e59067b557d6)
![Screenshot 2025-06-05 222226](https://github.com/user-attachments/assets/cd6dc250-552f-4bed-bd11-dcf9a352f0bf)

### 2. Frontend (mc-computers-ui)

1. **Navigate to Frontend Directory:**
    * Open a terminal or command prompt.
    * `cd path/to/your/project/MCComputersApp/mc-computers-ui`
2. **Install Dependencies:**
    * Run: `npm install`
3. **Configure API URL (Verify):**
    * Open `mc-computers-ui/src/app/services/invoice.service.ts`.
    * Verify the `private apiUrl` variable matches the HTTPS URL and port your backend API is running on (from step 1.5).
        * Example: `private apiUrl = 'https://localhost:7123/api/invoices';` (Adjust `7123` if your API port is different).
4. **Run the Angular App:**
    * Run: `ng serve --open`
    * This will open the application in your browser, usually at `http://localhost:4200/`.
![Screenshot 2025-06-05 212601](https://github.com/user-attachments/assets/ff3365f3-3c6d-499e-898f-b5907d577b69)
![Screenshot 2025-06-05 212635](https://github.com/user-attachments/assets/37651b00-3914-4310-8e0d-68ae3169588c)

## Functionality

The MC Computers Invoice System provides the following core functionalities:

* **Create Invoice:** Users can input transaction details, add multiple product items (name, quantity, unit price), and specify a discount. Upon submission, the invoice is saved to the database, and a PDF version is generated and downloaded by the client's browser.
* **View Invoices:** Displays a list of previously created invoices. Each invoice in the list has an option to "View PDF," which fetches the invoice details and re-generates/downloads the PDF for that specific invoice.

## Assumptions Made During Development

During the development of this system, the following assumptions were made:

* **Product Entry:** Users manually enter product details (name, quantity, unit price) directly on the invoice form; there is no pre-existing product catalog.
* **Discount Application:** The discount is a single monetary amount applied to the subtotal of all product items.
* **Balance Amount:** The balance amount is initially set to be equal to the total amount of the invoice. Payment tracking is not implemented.
* **Transaction Date:** Defaults to the current date but is editable by the user.
* **PDF Generation:**
    * PDFs are generated on the **client-side** using `jsPDF` and `jspdf-autotable`.
    * The PDF template is basic and includes company information (hardcoded for now), invoice details, itemized products, and totals.
    * For the "View PDF" option, the PDF is re-generated by fetching the invoice data again, rather than storing the PDF blob in the database or as a file on the server.
* **Error Handling:** Basic error messages are displayed. Detailed validation messages from the backend are logged to the console, and user-friendly messages are shown on the UI for common server errors or validation failures.
* **UI/UX:** The focus was on functionality and technical requirements. While some styling improvements were made, it is not a production-grade UI design.
* **Security:** No authentication or authorization is implemented; the API is open.
* **Database Seeding:** No automatic seed data is included in migrations; the database will be empty initially.

## Key Expectations Demonstrated

The project successfully demonstrates the following key expectations:

* **Frontend and Backend Communication:** Implemented via HTTP using Angular's `HttpClient` to the .NET API.
* **Error Handling and Validation:**
    * **Frontend:** Utilizes Angular Reactive Forms for client-side validation and displays error messages.
    * **Backend:** Employs Data Annotations on DTOs for validation and includes try-catch blocks in controller/service.
* **UI and Backend Consistency:** DTOs ensure consistent data structure, with calculations primarily handled on the backend.
* **HTTP Status Codes and Messaging:** The backend API uses appropriate HTTP status codes (200, 201, 400, 404, 500) and provides clear JSON responses or error messages.
* **Angular Services:** An `InvoiceService` is used for efficient API communication.
* **Angular Standalone Components:** The frontend is structured using Angular's modern standalone component architecture.
* **Client-Side PDF Generation:** Successfully implemented using `jsPDF` and `jspdf-autotable`.
* **Unit Testing (Backend):** Includes xUnit tests for API controller actions, with service dependencies mocked using Moq.
* **Code Quality and Best Practices:**
    * **Clean Code:** Efforts were made to use meaningful names and create modular components/services.
    * **SOLID (Backend):** A service layer (`IInvoiceService`/`InvoiceService`) separates business logic from controllers, promoting Single Responsibility and Dependency Inversion through dependency injection.
 
* Make sure to run backend api,otherwise result will be like this.

Successful invoice creation will generate looks like this.
![Screenshot 2025-06-05 212901](https://github.com/user-attachments/assets/a4ec4fa2-d24c-468e-ae4e-51aa10c4f195)

Unsuccessful invoice creation will generate looks like this.
![Screenshot 2025-06-05 224206](https://github.com/user-attachments/assets/39099863-c05e-41d5-a6f9-fbbd0f58e78a)




