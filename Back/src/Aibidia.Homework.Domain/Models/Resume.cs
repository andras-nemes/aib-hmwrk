using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace Aibidia.Homework.Domain.Models;

public class Resume
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string LinkedInUrl { get; set; }
    public string ResumeFilePath { get; set; }
    public bool AllowDataProcessing { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    
    // Navigation properties
    public int JobPositionId { get; set; }
    public JobPosition JobPosition { get; set; }

    public ICollection<QuestionAnswer> QuestionAnswers { get; set; } = new List<QuestionAnswer>();
}

public class ResumeConfiguration : IEntityTypeConfiguration<Resume>
{
    public void Configure(EntityTypeBuilder<Resume> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id)
            .ValueGeneratedOnAdd();
        builder.Property(r => r.Email).IsRequired().HasMaxLength(255);
        
        builder.HasOne(r => r.JobPosition)
            .WithMany(j => j.Resumes)
            .HasForeignKey(r => r.JobPositionId);
    }
}