using System.ComponentModel.DataAnnotations;
using Aibidia.Homework.Domain.Models.Views;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aibidia.Homework.Domain.Models;


public class JobPosition
{
    public int Id { get; set; }
    public string JobTitle { get; set; }
    public string? Description { get; set; }
    public string Location { get; set; }
    public Department Department { get; set; }
    public EmploymentType EmploymentType { get; set; }
    public JobStatus Status { get; set; }

    // Navigation properties
    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<Resume> Resumes { get; set; } = new List<Resume>();
}

public enum EmploymentType
{
    [Display(Name = "Permanent - Full Time")]
    PermanentFullTime,
    [Display(Name = "Permanent - Part Time")]
    PermanentPartTime
}

public enum Department
{
    [Display(Name = "Engineering")]
    Engineering,
    [Display(Name = "Sales Development")]
    SalesDevelopment,
    [Display(Name = "Customer Success")]
    CustomerSuccess,
}

public enum JobStatus
{
    Closed,
    Open
}

public class JobPositionConfiguration : IEntityTypeConfiguration<JobPosition>
{
    public void Configure(EntityTypeBuilder<JobPosition> builder)
    {
        builder.HasKey(j => j.Id);
        builder.Property(j => j.Id)
            .ValueGeneratedOnAdd();
        builder.Property(j => j.JobTitle).IsRequired().HasMaxLength(255);
        builder.Property(j => j.Description).HasMaxLength(500);

        builder.HasMany(j => j.Questions)
            .WithMany()
            .UsingEntity(j => j.ToTable("JobPositionQuestion"));
    }
}