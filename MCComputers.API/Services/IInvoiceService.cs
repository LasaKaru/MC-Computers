using MCComputers.API.DTOs;

namespace MCComputers.API.Services
{
    public interface IInvoiceService
    {
        Task<InvoiceDto?> CreateInvoiceAsync(InvoiceCreateDto invoiceCreateDto);
        Task<InvoiceDto?> GetInvoiceByIdAsync(Guid id);
        Task<IEnumerable<InvoiceDto>> GetAllInvoicesAsync();
    }
}
