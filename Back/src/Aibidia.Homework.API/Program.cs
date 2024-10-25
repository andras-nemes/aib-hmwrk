using Aibidia.Homework.API.Configuration;
using Aibidia.Homework.Application;
using Aibidia.Homework.Application.Resumes.Mapping;
using Aibidia.Homework.DataAccess.Configuration;
using Microsoft.ApplicationInsights.DependencyCollector;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Server.Kestrel.Core;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;
var services = builder.Services;

services.Configure<KestrelServerOptions>(options =>
{
    options.AddServerHeader = false;
});

services.AddApi(configuration)
    .AddApplication()
    .AddMultiTenantDataAccess()
    .AddAutoMapper(typeof(ResumeProfile));

services.AddAuthorization();
services.AddHealthChecks();

services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
});

// Enable SQL command tracking in Application Insights by default
services.ConfigureTelemetryModule<DependencyTrackingTelemetryModule>((module, o) =>
{
    module.EnableSqlCommandTextInstrumentation = configuration.GetValue<bool?>("SqlCommandTracking") ?? true;
});

builder.Services.AddHsts(options =>
{
    options.IncludeSubDomains = true;
    options.MaxAge = TimeSpan.FromDays(365);
});

if (!builder.Environment.IsDevelopment())
{
    builder.Services.AddHttpsRedirection(options =>
    {
        options.RedirectStatusCode = (int) System.Net.HttpStatusCode.PermanentRedirect;
        options.HttpsPort = 443;
    });
}

var app = builder.Build();

app.UseRouting();

app.UseHsts();
app.UseHttpsRedirection();

app.UseCors(ApiConstants.CorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment()
    || app.Environment.EnvironmentName == "Docker")
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();
app.UseHealthChecks("/health");
app.Run();
