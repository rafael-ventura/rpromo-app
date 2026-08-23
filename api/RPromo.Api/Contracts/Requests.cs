namespace RPromo.Api.Contracts;

public record StatusUpdateRequest(string Status);

public record DoNotCallRequest(bool Value, string? Reason);

public record PhotoUploadRequest(string Base64, string Filename, string MimeType);

public record PhotoUploadResponse(string FileId, string Url);

public record LoginRequest(string Username, string Password);

public record LoginResponse(string Token, DateTimeOffset ExpiresAt);

public record ErrorResponse(string Error);
