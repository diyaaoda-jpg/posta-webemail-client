using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using POSTA.Infrastructure.Data;
using POSTA.Core.Entities;

namespace POSTA.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmailsController : ControllerBase
{
    private readonly POSTADbContext _context;
    private readonly ILogger<EmailsController> _logger;

    public EmailsController(POSTADbContext context, ILogger<EmailsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("account/{accountId}")]
    public async Task<ActionResult<IEnumerable<EmailMessage>>> GetEmails(
        Guid accountId,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 50,
        [FromQuery] string? search = null,
        [FromQuery] string folder = "INBOX")
    {
        try
        {
            var query = _context.EmailMessages
                .Where(e => e.AccountId == accountId && 
                           e.FolderName == folder && 
                           !e.IsDeleted)
                .OrderByDescending(e => e.ReceivedAt);

            if (!string.IsNullOrEmpty(search))
            {
                query = (IOrderedQueryable<EmailMessage>)query.Where(e => 
                    e.Subject!.Contains(search) ||
                    e.TextBody!.Contains(search) ||
                    e.FromAddress.Contains(search));
            }

            var emails = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return Ok(new { emails, pagination = new { page, limit, total = emails.Count } });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching emails for account {AccountId}", accountId);
            return StatusCode(500, "Failed to fetch emails");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EmailMessage>> GetEmail(Guid id)
    {
        try
        {
            var email = await _context.EmailMessages
                .Include(e => e.Attachments)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (email == null)
                return NotFound("Email not found");

            return Ok(email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching email {EmailId}", id);
            return StatusCode(500, "Failed to fetch email");
        }
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, [FromBody] bool isRead)
    {
        try
        {
            var email = await _context.EmailMessages.FindAsync(id);
            if (email == null)
                return NotFound("Email not found");

            email.IsRead = isRead;
            email.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating read status for email {EmailId}", id);
            return StatusCode(500, "Failed to update read status");
        }
    }

    [HttpPatch("{id}/flag")]
    public async Task<IActionResult> ToggleFlag(Guid id, [FromBody] bool isFlagged)
    {
        try
        {
            var email = await _context.EmailMessages.FindAsync(id);
            if (email == null)
                return NotFound("Email not found");

            email.IsFlagged = isFlagged;
            email.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating flag status for email {EmailId}", id);
            return StatusCode(500, "Failed to update flag status");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmail(Guid id)
    {
        try
        {
            var email = await _context.EmailMessages.FindAsync(id);
            if (email == null)
                return NotFound("Email not found");

            email.IsDeleted = true;
            email.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting email {EmailId}", id);
            return StatusCode(500, "Failed to delete email");
        }
    }

    [HttpPatch("{id}/move")]
    public async Task<IActionResult> MoveToFolder(Guid id, [FromBody] MoveEmailRequest request)
    {
        try
        {
            var email = await _context.EmailMessages.FindAsync(id);
            if (email == null)
                return NotFound("Email not found");

            email.FolderName = request.Folder;
            email.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, folder = request.Folder });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error moving email {EmailId} to folder {Folder}", id, request.Folder);
            return StatusCode(500, "Failed to move email");
        }
    }
}

public class MoveEmailRequest
{
    public string Folder { get; set; } = string.Empty;
}