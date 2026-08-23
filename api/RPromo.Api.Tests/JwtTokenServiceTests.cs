using Microsoft.Extensions.Configuration;
using RPromo.Api.Services;
using Xunit;

namespace RPromo.Api.Tests;

public class JwtTokenServiceTests
{
    private static ITokenService BuildService()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = "unit-test-secret-key-at-least-32-chars-long",
                ["Jwt:Issuer"] = "RPromo.Tests",
                ["Jwt:ExpiresMinutes"] = "60",
            })
            .Build();
        return new JwtTokenService(config);
    }

    [Fact]
    public void CreateToken_ReturnsNonEmptyTokenAndFutureExpiry()
    {
        var service = BuildService();

        var (token, expiresAt) = service.CreateToken("admin");

        Assert.False(string.IsNullOrWhiteSpace(token));
        Assert.True(expiresAt > DateTimeOffset.UtcNow);
    }

    [Fact]
    public void CreateToken_MissingSecret_Throws()
    {
        var config = new ConfigurationBuilder().Build();
        var service = new JwtTokenService(config);

        Assert.Throws<InvalidOperationException>(() => service.CreateToken("admin"));
    }
}
