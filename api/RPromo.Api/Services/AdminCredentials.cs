namespace RPromo.Api.Services;

/// <summary>Resolves once at startup: prefers a pre-hashed Admin:PasswordHash (production),
/// falls back to hashing the plaintext Admin:Password (local dev default: "rpromo").</summary>
public class AdminCredentials
{
    public string Username { get; }
    public string PasswordHash { get; }

    public AdminCredentials(IConfiguration config)
    {
        Username = config["Admin:Username"] ?? "admin";

        var hash = config["Admin:PasswordHash"];
        if (!string.IsNullOrWhiteSpace(hash))
        {
            PasswordHash = hash;
            return;
        }

        var plain = config["Admin:Password"] ?? "rpromo";
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(plain);
    }
}
