using Aibidia.Homework.Application.Resumes.Mapping;
using Aibidia.Homework.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aibidia.Homework.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IResumeService, ResumeService>();
        services.AddAutoMapper(cfg =>
        {
            cfg.AddProfile<ResumeProfile>();
            cfg.AddProfile<JobPositionProfile>();
        });
        return services;
    }
}
