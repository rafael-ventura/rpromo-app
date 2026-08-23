using Microsoft.EntityFrameworkCore;
using RPromo.Api.Contracts;
using RPromo.Api.Data;
using RPromo.Api.Domain;

namespace RPromo.Api.Services;

public class EfPeopleRepository : IPeopleRepository
{
    private readonly AppDbContext _db;

    public EfPeopleRepository(AppDbContext db) => _db = db;

    public async Task<List<Person>> ListAsync(CancellationToken ct) =>
        await _db.People.AsNoTracking().OrderByDescending(p => p.CreatedAt).ToListAsync(ct);

    public async Task<Person> CreateAsync(PersonInput input, CancellationToken ct)
    {
        var person = new Person
        {
            Id = Guid.NewGuid().ToString(),
            CreatedAt = DateTime.UtcNow,
            Status = "active",
        };
        Map(person, input);
        _db.People.Add(person);
        await _db.SaveChangesAsync(ct);
        return person;
    }

    public async Task<Person?> UpdateAsync(string id, PersonInput input, CancellationToken ct)
    {
        var person = await _db.People.FindAsync(new object[] { id }, ct);
        if (person is null) return null;
        Map(person, input);
        person.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return person;
    }

    public async Task<Person?> SetStatusAsync(string id, string status, CancellationToken ct)
    {
        var person = await _db.People.FindAsync(new object[] { id }, ct);
        if (person is null) return null;
        person.Status = status;
        person.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return person;
    }

    public async Task<Person?> SetDoNotCallAsync(string id, bool value, string? reason, CancellationToken ct)
    {
        var person = await _db.People.FindAsync(new object[] { id }, ct);
        if (person is null) return null;
        person.DoNotCall = value;
        person.DoNotCallReason = value ? reason : null;
        person.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return person;
    }

    private static void Map(Person person, PersonInput input)
    {
        person.FullName = input.FullName;
        person.Cpf = input.Cpf;
        person.Rg = input.Rg;
        person.IssuingAgency = input.IssuingAgency;
        person.IssueDate = input.IssueDate;
        person.BirthDate = input.BirthDate;
        person.Sex = input.Sex;
        person.RaceColor = input.RaceColor;
        person.Birthplace = input.Birthplace;
        person.FatherName = input.FatherName;
        person.MotherName = input.MotherName;
        person.Email = input.Email;
        person.Phone = input.Phone;
        person.Street = input.Street;
        person.Neighborhood = input.Neighborhood;
        person.City = input.City;
        person.Region = input.Region;
        person.ZipCode = input.ZipCode;
        person.VoterId = input.VoterId;
        person.VoterZone = input.VoterZone;
        person.VoterSection = input.VoterSection;
        person.WorkCard = input.WorkCard;
        person.WorkCardIssueDate = input.WorkCardIssueDate;
        person.Pis = input.Pis;
        person.MilitaryCert = input.MilitaryCert;
        person.AccountType = input.AccountType;
        person.BankAgency = input.BankAgency;
        person.AccountNumber = input.AccountNumber;
        person.Bank = input.Bank;
        person.PixKey = input.PixKey;
        person.HasChildren = input.HasChildren;
        person.ChildrenCount = input.ChildrenCount;
        person.Children = input.Children;
        person.PhotoUrl = input.PhotoUrl;
    }
}
