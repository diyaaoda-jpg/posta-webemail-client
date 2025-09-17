using System.ComponentModel.DataAnnotations;

namespace POSTA.Core.Entities;

public class EmailAccount
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid UserId { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string AccountName { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string EmailAddress { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string ServerType { get; set; } = string.Empty; // "imap", "exchange"
    
    [Required]
    [MaxLength(255)]
    public string ServerHost { get; set; } = string.Empty;
    
    public int ServerPort { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    public bool UseSsl { get; set; } = true;
    
    [MaxLength(255)]
    public string? SmtpHost { get; set; }
    
    public int? SmtpPort { get; set; }
    
    [MaxLength(255)]
    public string? DisplayName { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime? LastSyncAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<EmailMessage> EmailMessages { get; set; } = new List<EmailMessage>();
    public virtual ICollection<EmailDraft> EmailDrafts { get; set; } = new List<EmailDraft>();
}