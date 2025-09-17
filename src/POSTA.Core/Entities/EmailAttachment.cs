using System.ComponentModel.DataAnnotations;

namespace POSTA.Core.Entities;

public class EmailAttachment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid MessageId { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Filename { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? ContentType { get; set; }
    
    public int Size { get; set; }
    
    [MaxLength(255)]
    public string? ContentId { get; set; }
    
    public bool IsInline { get; set; } = false;
    
    public string? FilePath { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public virtual EmailMessage Message { get; set; } = null!;
}