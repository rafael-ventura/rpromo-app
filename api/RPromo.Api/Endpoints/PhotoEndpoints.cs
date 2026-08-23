using RPromo.Api.Contracts;
using RPromo.Api.Services;

namespace RPromo.Api.Endpoints;

public static class PhotoEndpoints
{
    public static void MapPhotoEndpoints(this WebApplication app)
    {
        // Public: uploaded as part of the registration flow, before the person has admin-visible status.
        app.MapPost("/api/photos", async (PhotoUploadRequest request, IPhotoStorage storage, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Base64))
                return Results.Json(new ErrorResponse("Arquivo vazio"), statusCode: StatusCodes.Status400BadRequest);

            var (fileId, url) = await storage.SaveAsync(request.Base64, request.Filename, request.MimeType, ct);
            return Results.Ok(new PhotoUploadResponse(fileId, url));
        }).WithTags("Photos");
    }
}
