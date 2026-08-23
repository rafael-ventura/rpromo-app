namespace RPromo.Api.Services;

public interface IPhotoStorage
{
    Task<(string FileId, string Url)> SaveAsync(string base64, string filename, string mimeType, CancellationToken ct);
}
