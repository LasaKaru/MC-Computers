using MCComputers.API.DTOs;
using MCComputers.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace MCComputers.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InvoicesController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;
        private readonly ILogger<InvoicesController> _logger;

        public InvoicesController(IInvoiceService invoiceService, ILogger<InvoicesController> logger)
        {
            _invoiceService = invoiceService;
            _logger = logger;
        }

        [HttpPost]
        [ProducesResponseType(typeof(InvoiceDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateInvoice([FromBody] InvoiceCreateDto invoiceCreateDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("CreateInvoice called with invalid model state.");
                return BadRequest(ModelState);
            }

            try
            {
                var createdInvoiceDto = await _invoiceService.CreateInvoiceAsync(invoiceCreateDto);

                if (createdInvoiceDto == null)
                {
                    _logger.LogWarning("Invoice creation failed at service level.");
                    return BadRequest("Could not create invoice due to business rule violation.");
                }
                return CreatedAtAction(nameof(GetInvoiceById), new { id = createdInvoiceDto.Id }, createdInvoiceDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating the invoice.");
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred. Please try again later.");
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(InvoiceDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetInvoiceById(Guid id)
        {
            try
            {
                var invoiceDto = await _invoiceService.GetInvoiceByIdAsync(id);
                if (invoiceDto == null)
                {
                    _logger.LogInformation("Invoice with ID {InvoiceId} not found.", id);
                    return NotFound($"Invoice with ID {id} not found.");
                }
                return Ok(invoiceDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoice with ID {InvoiceId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving the invoice.");
            }
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<InvoiceDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllInvoices()
        {
            try
            {
                var invoices = await _invoiceService.GetAllInvoicesAsync();
                return Ok(invoices);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving all invoices.");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving invoices.");
            }
        }
    }
}
