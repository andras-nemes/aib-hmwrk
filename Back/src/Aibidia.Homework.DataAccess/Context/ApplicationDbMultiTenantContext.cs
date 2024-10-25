using Aibidia.Homework.DataAccess.Configuration;
using Aibidia.Homework.Domain.Models;
using Aibidia.Homework.Domain.Models.Views;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;

namespace Aibidia.Homework.DataAccess.Context;

public class ApplicationDbMultiTenantContext : DbContext, IApplicationDbContext
{
    private readonly ITenantService _tenantService;

    public ApplicationDbMultiTenantContext(
        ITenantService tenantService)
    {
        _tenantService = tenantService;
    }

    public DbSet<JobPosition> JobPositions { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Resume> Resumes { get; set; }
    public DbSet<QuestionAnswer> ResumeAnswers { get; set; }

    public DbSet<ResumeActive> ActiveResumes { get; set; } = null!;

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Conventions.Remove(typeof(TableNameFromDbSetConvention));
        base.ConfigureConventions(configurationBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("dbo");

        modelBuilder.ApplyConfiguration(new JobPositionConfiguration());
        modelBuilder.ApplyConfiguration(new QuestionConfiguration());
        modelBuilder.ApplyConfiguration(new ResumeConfiguration());
        modelBuilder.ApplyConfiguration(new ResumeAnswerConfiguration());
        modelBuilder.ApplyConfiguration(new ResumeActiveConfiguration());
    }

    public async Task<int> SaveChangesAsync()
    {
        return await base.SaveChangesAsync();
    }

    public async Task ExecuteCommandAsync(string rawSqlQuery, params object[] parameters)
    {
        await using var transaction = await Database.BeginTransactionAsync();
        try
        {
            await Database.ExecuteSqlRawAsync(rawSqlQuery, parameters);
            await transaction.CommitAsync();
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        var connectionString = _tenantService.GetConnectionString();
        optionsBuilder.UseSqlServer(connectionString);
    }
}
