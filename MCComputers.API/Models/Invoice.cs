using System.ComponentModel.DataAnnotations;

namespace MCComputers.API.Models
{
    public class Invoice
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public DateTime TransactionDate { get; set; }

        public decimal Discount { get; set; }

        [Required]
        public decimal TotalAmount { get; set; } 

        [Required]
        public decimal BalanceAmount { get; set; }

        public ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
    }
}
