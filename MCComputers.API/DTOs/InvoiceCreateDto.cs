using System.ComponentModel.DataAnnotations;

namespace MCComputers.API.DTOs
{
    public class InvoiceCreateDto
    {
        [Required]
        public DateTime TransactionDate { get; set; }

        public decimal Discount { get; set; } = 0; 

        [Required]
        [MinLength(1, ErrorMessage = "At least one product item is required.")]
        public List<InvoiceItemCreateDto> InvoiceItems { get; set; } = new List<InvoiceItemCreateDto>();
    }
}
