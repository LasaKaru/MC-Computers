using MCComputers.API.Data;
using MCComputers.API.DTOs;
using MCComputers.API.Models;
using Microsoft.EntityFrameworkCore;

namespace MCComputers.API.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly ApplicationDbContext _context;

        public InvoiceService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<InvoiceDto?> CreateInvoiceAsync(InvoiceCreateDto invoiceCreateDto)
        {
            if (invoiceCreateDto == null || !invoiceCreateDto.InvoiceItems.Any())
            {
                return null;
            }

            var invoice = new Invoice
            {
                Id = Guid.NewGuid(),
                TransactionDate = invoiceCreateDto.TransactionDate,
                Discount = invoiceCreateDto.Discount
            };

            decimal subTotal = 0;
            foreach (var itemDto in invoiceCreateDto.InvoiceItems)
            {
                var lineTotal = itemDto.Quantity * itemDto.UnitPrice;
                subTotal += lineTotal;

                invoice.InvoiceItems.Add(new InvoiceItem
                {
                    Id = Guid.NewGuid(),
                    InvoiceId = invoice.Id,
                    ProductName = itemDto.ProductName,
                    Quantity = itemDto.Quantity,
                    UnitPrice = itemDto.UnitPrice,
                    LineTotal = lineTotal
                });
            }

            invoice.TotalAmount = subTotal - invoice.Discount;
            if (invoice.TotalAmount < 0) invoice.TotalAmount = 0; 
            invoice.BalanceAmount = invoice.TotalAmount; 

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            return MapInvoiceToDto(invoice);
        }

        private InvoiceDto MapInvoiceToDto(Invoice invoice)
        {
            return new InvoiceDto
            {
                Id = invoice.Id,
                TransactionDate = invoice.TransactionDate,
                Discount = invoice.Discount,
                TotalAmount = invoice.TotalAmount,
                BalanceAmount = invoice.BalanceAmount,
                InvoiceItems = invoice.InvoiceItems.Select(ii => new InvoiceItemDto
                {
                    Id = ii.Id,
                    ProductName = ii.ProductName,
                    Quantity = ii.Quantity,
                    UnitPrice = ii.UnitPrice,
                    LineTotal = ii.LineTotal
                }).ToList()
            };
        }

        public async Task<InvoiceDto?> GetInvoiceByIdAsync(Guid id)
        {
            var invoice = await _context.Invoices
                                        .Include(i => i.InvoiceItems)
                                        .FirstOrDefaultAsync(i => i.Id == id);
            return invoice == null ? null : MapInvoiceToDto(invoice);
        }

        public async Task<IEnumerable<InvoiceDto>> GetAllInvoicesAsync()
        {
            var invoices = await _context.Invoices
                                         .Include(i => i.InvoiceItems)
                                         .ToListAsync();
            return invoices.Select(MapInvoiceToDto);
        }
    }
}
