using System.ComponentModel.DataAnnotations;

namespace MCComputers.API.DTOs
{
    public class InvoiceItemCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string ProductName { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Required]
        [Range(0.01, (double)decimal.MaxValue)]
        public decimal UnitPrice { get; set; }
    }
}
