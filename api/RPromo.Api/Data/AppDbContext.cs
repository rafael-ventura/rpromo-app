using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using RPromo.Api.Domain;

namespace RPromo.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Person> People => Set<Person>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var childrenComparer = new ValueComparer<List<Child>>(
            (a, b) => (a ?? new()).SequenceEqual(b ?? new()),
            v => v.Aggregate(0, (hash, c) => HashCode.Combine(hash, c.GetHashCode())),
            v => v.ToList());

        modelBuilder.Entity<Person>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.HasIndex(p => p.Cpf);
            entity.Property(p => p.Children)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<Child>>(v, (JsonSerializerOptions?)null) ?? new List<Child>())
                .Metadata.SetValueComparer(childrenComparer);
        });
    }
}
