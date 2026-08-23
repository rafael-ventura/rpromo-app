using RPromo.Api.Contracts;
using RPromo.Api.Services;

namespace RPromo.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/login", (LoginRequest request, AdminCredentials creds, ITokenService tokenService) =>
        {
            var valid = string.Equals(request.Username, creds.Username, StringComparison.OrdinalIgnoreCase)
                && BCrypt.Net.BCrypt.Verify(request.Password, creds.PasswordHash);

            if (!valid)
                return Results.Json(new ErrorResponse("Usuário ou senha inválidos"), statusCode: StatusCodes.Status401Unauthorized);

            var (token, expiresAt) = tokenService.CreateToken(creds.Username);
            return Results.Ok(new LoginResponse(token, expiresAt));
        });
    }
}
