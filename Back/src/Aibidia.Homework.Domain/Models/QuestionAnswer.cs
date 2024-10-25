using Aibidia.Homework.Domain.Models.Views;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aibidia.Homework.Domain.Models;

public class QuestionAnswer
{
    public int Id { get; set; }
    public bool Answer { get; set; }
    
    // Navigation properties
    public int ResumeId { get; set; }
    public Resume Resume { get; set; }
    
    public int QuestionId { get; set; }
    public Question Question { get; set; }
}

public class ResumeAnswerConfiguration : IEntityTypeConfiguration<QuestionAnswer>
{
    public void Configure(EntityTypeBuilder<QuestionAnswer> builder)
    {
        builder.HasKey(qa => qa.Id);
        builder.Property(qa => qa.Id)
            .ValueGeneratedOnAdd();
        builder.Property(qa => qa.Answer).IsRequired();

        builder.HasOne(qa => qa.Resume)
            .WithMany(r => r.QuestionAnswers)
            .HasForeignKey(qa => qa.ResumeId);

        builder.HasOne(qa => qa.Question)
            .WithMany(q => q.QuestionAnswers)
            .HasForeignKey(qa => qa.QuestionId);

        builder.HasIndex(qa => new { qa.ResumeId, qa.QuestionId }).IsUnique(); // Ensures a question is answered only once per resume
    }
}