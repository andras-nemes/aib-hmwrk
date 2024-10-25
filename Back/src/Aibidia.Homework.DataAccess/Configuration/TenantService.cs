using Microsoft.Extensions.Configuration;

namespace Aibidia.Homework.DataAccess.Configuration;

public class TenantService : ITenantService
{
    private readonly IConfiguration _configuration;

    public TenantService(
        IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GetConnectionString()
    {
        var connectionString = _configuration.GetConnectionString("DbConnectionString");
        ArgumentNullException.ThrowIfNullOrEmpty(nameof(connectionString));

        return connectionString;
    }
}
