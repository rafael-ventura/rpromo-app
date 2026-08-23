namespace RPromo.Api.Services;

public interface ITokenService
{
    (string Token, DateTimeOffset ExpiresAt) CreateToken(string username);
}
