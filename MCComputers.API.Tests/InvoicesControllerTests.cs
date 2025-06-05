using MCComputers.API.Controllers;
using MCComputers.API.DTOs;
using MCComputers.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;

namespace MCComputers.API.Tests
{
    public class InvoicesControllerTests
    {
        private readonly Mock<IInvoiceService> _mockInvoiceService;
        private readonly Mock<ILogger<InvoicesController>> _mockLogger;
        private readonly InvoicesController _controller;

        public InvoicesControllerTests()
        {
            _mockInvoiceService = new Mock<IInvoiceService>();
            _mockLogger = new Mock<ILogger<InvoicesController>>();
            _controller = new InvoicesController(_mockInvoiceService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task CreateInvoice_ValidModel_ReturnsCreatedAtActionResult()
        {
            // Arrange
            var invoiceCreateDto = new InvoiceCreateDto
            {
                TransactionDate = DateTime.UtcNow,
                Discount = 5,
                InvoiceItems = new List<InvoiceItemCreateDto>
            {
                new InvoiceItemCreateDto { ProductName = "Test Product", Quantity = 1, UnitPrice = 10 }
            }
            };
            var createdInvoiceDto = new InvoiceDto
            {
                Id = Guid.NewGuid(),
                TransactionDate = invoiceCreateDto.TransactionDate,
                TotalAmount = 5 // (1*10) - 5
            };

            _mockInvoiceService.Setup(s => s.CreateInvoiceAsync(invoiceCreateDto))
                .ReturnsAsync(createdInvoiceDto);

            // Act
            var result = await _controller.CreateInvoice(invoiceCreateDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(_controller.GetInvoiceById), createdAtActionResult.ActionName);
            Assert.Equal(createdInvoiceDto, createdAtActionResult.Value);
            Assert.Equal(201, createdAtActionResult.StatusCode);
        }

        [Fact]
        public async Task CreateInvoice_InvalidModel_ReturnsBadRequest()
        {
            // Arrange
            var invoiceCreateDto = new InvoiceCreateDto(); 
            _controller.ModelState.AddModelError("InvoiceItems", "At least one product item is required."); 

            // Act
            var result = await _controller.CreateInvoice(invoiceCreateDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.IsType<SerializableError>(badRequestResult.Value); 
            Assert.Equal(400, badRequestResult.StatusCode);
        }

        [Fact]
        public async Task GetInvoiceById_InvoiceExists_ReturnsOkResultWithInvoice()
        {
            // Arrange
            var invoiceId = Guid.NewGuid();
            var invoiceDto = new InvoiceDto { Id = invoiceId, TotalAmount = 100 };
            _mockInvoiceService.Setup(s => s.GetInvoiceByIdAsync(invoiceId)).ReturnsAsync(invoiceDto);

            // Act
            var result = await _controller.GetInvoiceById(invoiceId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(invoiceDto, okResult.Value);
            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task GetInvoiceById_InvoiceDoesNotExist_ReturnsNotFoundResult()
        {
            // Arrange
            var invoiceId = Guid.NewGuid();
            _mockInvoiceService.Setup(s => s.GetInvoiceByIdAsync(invoiceId)).ReturnsAsync((InvoiceDto?)null);

            // Act
            var result = await _controller.GetInvoiceById(invoiceId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal(404, notFoundResult.StatusCode);
        }
    }
}