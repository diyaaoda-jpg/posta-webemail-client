using System.ComponentModel.DataAnnotations;

namespace POSTA.Core.Entities;

public class EmailMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid AccountId { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string ServerMessageId { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? MessageId { get; set; }
    
    [MaxLength(255)]
    public string? ThreadId { get; set; }
    
    [MaxLength(500)]
    public string? InReplyTo { get; set; }
    
    public string? References { get; set; }
    
    public string? Subject { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string FromAddress { get; set; } = string.Empty;
    
    [MaxLength(255)]
    public string? FromName { get; set; }
    
    public string? ToAddresses { get; set; } // JSON array
    
    public string? CcAddresses { get; set; } // JSON array
    
    public string? BccAddresses { get; set; } // JSON array
    
    public string? ReplyToAddresses { get; set; } // JSON array
    
    public string? TextBody { get; set; }
    
    public string? HtmlBody { get; set; }
    
    public DateTime ReceivedAt { get; set; }
    
    public DateTime? SentAt { get; set; }
    
    public bool IsRead { get; set; } = false;
    
    public bool IsFlagged { get; set; } = false;
    
    public bool IsDeleted { get; set; } = false;
    
    [MaxLength(255)]
    public string FolderName { get; set; } = "INBOX";
    
    [MaxLength(20)]
    public string Priority { get; set; } = "normal";
    
    public bool HasAttachments { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual EmailAccount Account { get; set; } = null!;
    public virtual ICollection<EmailAttachment> Attachments { get; set; } = new List<EmailAttachment>();
}