using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aibidia.Homework.Domain.Models.Views;

public class Question
{
    public int Id { get; set; }
    public string Text { get; set; }
    
    // Navigation properties
    public ICollection<QuestionAnswer> QuestionAnswers { get; set; } = new List<QuestionAnswer>();
}

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.HasKey(q => q.Id);
        builder.Property(q => q.Id)
            .ValueGeneratedOnAdd();
        builder.Property(q => q.Text).IsRequired().HasMaxLength(255);
    }
}