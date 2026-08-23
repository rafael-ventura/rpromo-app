using RPromo.Api.Contracts;
using RPromo.Api.Domain;

namespace RPromo.Api.Services;

public interface IPeopleRepository
{
    Task<List<Person>> ListAsync(CancellationToken ct);
    Task<Person> CreateAsync(PersonInput input, CancellationToken ct);
    Task<Person?> UpdateAsync(string id, PersonInput input, CancellationToken ct);
    Task<Person?> SetStatusAsync(string id, string status, CancellationToken ct);
    Task<Person?> SetDoNotCallAsync(string id, bool value, string? reason, CancellationToken ct);
}
