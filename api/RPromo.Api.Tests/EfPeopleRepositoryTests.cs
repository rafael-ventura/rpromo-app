using Microsoft.EntityFrameworkCore;
using RPromo.Api.Contracts;
using RPromo.Api.Data;
using RPromo.Api.Domain;
using RPromo.Api.Services;
using Xunit;

namespace RPromo.Api.Tests;

public class EfPeopleRepositoryTests
{
    private static AppDbContext NewInMemoryDb() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private static PersonInput SamplePersonInput() => new()
    {
        FullName = "Maria Silva",
        Cpf = "12345678900",
        Phone = "21999999999",
        BirthDate = "1990-01-01",
        Children = new List<Child> { new("Joana", "2015-05-10") },
        HasChildren = true,
        ChildrenCount = 1,
    };

    [Fact]
    public async Task CreateAsync_PersistsPersonWithGeneratedIdAndActiveStatus()
    {
        await using var db = NewInMemoryDb();
        var repo = new EfPeopleRepository(db);

        var created = await repo.CreateAsync(SamplePersonInput(), CancellationToken.None);

        Assert.False(string.IsNullOrWhiteSpace(created.Id));
        Assert.Equal("active", created.Status);
        Assert.Equal("Maria Silva", created.FullName);
        Assert.Single(created.Children);
        Assert.Equal("Joana", created.Children[0].Name);
    }

    [Fact]
    public async Task SetDoNotCallAsync_UnknownId_ReturnsNull()
    {
        await using var db = NewInMemoryDb();
        var repo = new EfPeopleRepository(db);

        var result = await repo.SetDoNotCallAsync("does-not-exist", true, "motivo", CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task SetDoNotCallAsync_ClearingFlag_AlsoClearsReason()
    {
        await using var db = NewInMemoryDb();
        var repo = new EfPeopleRepository(db);
        var created = await repo.CreateAsync(SamplePersonInput(), CancellationToken.None);

        await repo.SetDoNotCallAsync(created.Id, true, "não atende", CancellationToken.None);
        var cleared = await repo.SetDoNotCallAsync(created.Id, false, null, CancellationToken.None);

        Assert.NotNull(cleared);
        Assert.False(cleared!.DoNotCall);
        Assert.Null(cleared.DoNotCallReason);
    }

    [Fact]
    public async Task ListAsync_ReturnsNewestFirst()
    {
        await using var db = NewInMemoryDb();
        var repo = new EfPeopleRepository(db);

        var first = await repo.CreateAsync(SamplePersonInput(), CancellationToken.None);
        await Task.Delay(5);
        var second = await repo.CreateAsync(SamplePersonInput(), CancellationToken.None);

        var list = await repo.ListAsync(CancellationToken.None);

        Assert.Equal(2, list.Count);
        Assert.Equal(second.Id, list[0].Id);
        Assert.Equal(first.Id, list[1].Id);
    }
}
