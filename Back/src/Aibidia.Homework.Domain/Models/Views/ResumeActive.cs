using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace Aibidia.Homework.Domain.Models.Views;

public class ResumeActive
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
}

public class ResumeActiveConfiguration : IEntityTypeConfiguration<ResumeActive>
{
    public void Configure(EntityTypeBuilder<ResumeActive> builder)
    {
        builder.HasKey(e => e.Id);
    }
}
