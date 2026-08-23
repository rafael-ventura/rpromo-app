using Microsoft.Extensions.Configuration;
using RPromo.Api.Services;
using Xunit;

namespace RPromo.Api.Tests;

public class AdminCredentialsTests
{
    [Fact]
    public void FallsBackToHashingPlaintextPassword_WhenNoPasswordHashConfigured()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Admin:Username"] = "admin",
                ["Admin:Password"] = "rpromo",
            })
            .Build();

        var creds = new AdminCredentials(config);

        Assert.Equal("admin", creds.Username);
        Assert.True(BCrypt.Net.BCrypt.Verify("rpromo", creds.PasswordHash));
        Assert.False(BCrypt.Net.BCrypt.Verify("wrong-password", creds.PasswordHash));
    }

    [Fact]
    public void UsesPreHashedPassword_WhenConfigured()
    {
        var preHashed = BCrypt.Net.BCrypt.HashPassword("prod-secret");
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Admin:PasswordHash"] = preHashed,
            })
            .Build();

        var creds = new AdminCredentials(config);

        Assert.Equal(preHashed, creds.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify("prod-secret", creds.PasswordHash));
    }
}
