using System.ComponentModel.DataAnnotations;

namespace POSTA.Core.Entities;

public class EmailDraft
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid UserId { get; set; }
    
    public Guid AccountId { get; set; }
    
    public string? Subject { get; set; }
    
    public string? ToAddresses { get; set; } // JSON array
    
    public string? CcAddresses { get; set; } // JSON array
    
    public string? BccAddresses { get; set; } // JSON array
    
    public string? TextBody { get; set; }
    
    public string? HtmlBody { get; set; }
    
    [MaxLength(500)]
    public string? InReplyTo { get; set; }
    
    [MaxLength(255)]
    public string? ThreadId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual EmailAccount Account { get; set; } = null!;
}