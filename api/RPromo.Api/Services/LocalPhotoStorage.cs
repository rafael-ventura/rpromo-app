namespace RPromo.Api.Services;

/// <summary>Stores photos on local disk under wwwroot/uploads/photos, served via static files.
/// Swappable later for a cloud storage implementation behind the same interface.</summary>
public class LocalPhotoStorage : IPhotoStorage
{
    private readonly string _root;
    private readonly string _publicBaseUrl;

    public LocalPhotoStorage(IWebHostEnvironment env, IConfiguration config)
    {
        _root = Path.Combine(env.ContentRootPath, "wwwroot", "uploads", "photos");
        Directory.CreateDirectory(_root);
        _publicBaseUrl = (config["PublicBaseUrl"] ?? "http://localhost:5000").TrimEnd('/');
    }

    public async Task<(string FileId, string Url)> SaveAsync(string base64, string filename, string mimeType, CancellationToken ct)
    {
        var fileId = Guid.NewGuid().ToString("N");
        var ext = Path.GetExtension(filename);
        if (string.IsNullOrWhiteSpace(ext))
        {
            ext = mimeType switch
            {
                "image/png" => ".png",
                "image/webp" => ".webp",
                _ => ".jpg",
            };
        }

        var fileName = $"{fileId}{ext}";
        var bytes = Convert.FromBase64String(base64);
        await File.WriteAllBytesAsync(Path.Combine(_root, fileName), bytes, ct);

        var url = $"{_publicBaseUrl}/uploads/photos/{fileName}";
        return (fileId, url);
    }
}
