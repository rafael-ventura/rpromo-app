using RPromo.Api.Contracts;
using RPromo.Api.Services;

namespace RPromo.Api.Endpoints;

public static class PeopleEndpoints
{
    public static void MapPeopleEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/people").WithTags("People");

        group.MapGet("/", async (IPeopleRepository repo, CancellationToken ct) =>
            Results.Ok(await repo.ListAsync(ct)))
            .RequireAuthorization();

        // Public: the registration form creates its own record.
        group.MapPost("/", async (PersonInput input, IPeopleRepository repo, CancellationToken ct) =>
        {
            var error = Validate(input);
            if (error is not null) return Results.Json(new ErrorResponse(error), statusCode: StatusCodes.Status400BadRequest);

            var person = await repo.CreateAsync(input, ct);
            return Results.Created($"/api/people/{person.Id}", person);
        });

        group.MapPut("/{id}", async (string id, PersonInput input, IPeopleRepository repo, CancellationToken ct) =>
        {
            var error = Validate(input);
            if (error is not null) return Results.Json(new ErrorResponse(error), statusCode: StatusCodes.Status400BadRequest);

            var person = await repo.UpdateAsync(id, input, ct);
            return person is null
                ? Results.NotFound(new ErrorResponse("Pessoa não encontrada"))
                : Results.Ok(person);
        }).RequireAuthorization();

        group.MapPatch("/{id}/status", async (string id, StatusUpdateRequest request, IPeopleRepository repo, CancellationToken ct) =>
        {
            var person = await repo.SetStatusAsync(id, request.Status, ct);
            return person is null
                ? Results.NotFound(new ErrorResponse("Pessoa não encontrada"))
                : Results.Ok(person);
        }).RequireAuthorization();

        group.MapPatch("/{id}/do-not-call", async (string id, DoNotCallRequest request, IPeopleRepository repo, CancellationToken ct) =>
        {
            var person = await repo.SetDoNotCallAsync(id, request.Value, request.Reason, ct);
            return person is null
                ? Results.NotFound(new ErrorResponse("Pessoa não encontrada"))
                : Results.Ok(person);
        }).RequireAuthorization();
    }

    private static string? Validate(PersonInput input)
    {
        if (string.IsNullOrWhiteSpace(input.FullName)) return "Nome completo é obrigatório";
        if (string.IsNullOrWhiteSpace(input.Cpf)) return "CPF é obrigatório";
        if (string.IsNullOrWhiteSpace(input.Phone)) return "Telefone é obrigatório";
        if (string.IsNullOrWhiteSpace(input.BirthDate)) return "Data de nascimento é obrigatória";
        return null;
    }
}
