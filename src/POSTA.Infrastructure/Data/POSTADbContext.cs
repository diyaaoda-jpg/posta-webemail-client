using Microsoft.EntityFrameworkCore;
using POSTA.Core.Entities;

namespace POSTA.Infrastructure.Data;

public class POSTADbContext : DbContext
{
    public POSTADbContext(DbContextOptions<POSTADbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<EmailAccount> EmailAccounts { get; set; }
    public DbSet<EmailMessage> EmailMessages { get; set; }
    public DbSet<EmailAttachment> EmailAttachments { get; set; }
    public DbSet<EmailDraft> EmailDrafts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired();
        });

        // EmailAccount configuration
        modelBuilder.Entity<EmailAccount>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.Property(e => e.AccountName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.EmailAddress).IsRequired().HasMaxLength(255);
            entity.Property(e => e.ServerType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.ServerHost).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired();

            entity.HasOne(e => e.User)
                  .WithMany(u => u.EmailAccounts)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // EmailMessage configuration
        modelBuilder.Entity<EmailMessage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.AccountId);
            entity.HasIndex(e => e.ThreadId);
            entity.HasIndex(e => e.ReceivedAt);
            entity.HasIndex(e => e.Subject);
            entity.Property(e => e.ServerMessageId).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FromAddress).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FolderName).HasMaxLength(255).HasDefaultValue("INBOX");
            entity.Property(e => e.Priority).HasMaxLength(20).HasDefaultValue("normal");

            entity.HasOne(e => e.Account)
                  .WithMany(a => a.EmailMessages)
                  .HasForeignKey(e => e.AccountId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // EmailAttachment configuration
        modelBuilder.Entity<EmailAttachment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.MessageId);
            entity.Property(e => e.Filename).IsRequired().HasMaxLength(255);
            entity.Property(e => e.ContentType).HasMaxLength(100);
            entity.Property(e => e.ContentId).HasMaxLength(255);

            entity.HasOne(e => e.Message)
                  .WithMany(m => m.Attachments)
                  .HasForeignKey(e => e.MessageId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // EmailDraft configuration
        modelBuilder.Entity<EmailDraft>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.Property(e => e.InReplyTo).HasMaxLength(500);
            entity.Property(e => e.ThreadId).HasMaxLength(255);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.EmailDrafts)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Account)
                  .WithMany(a => a.EmailDrafts)
                  .HasForeignKey(e => e.AccountId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}