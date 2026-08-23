namespace RPromo.Api.Domain;

public class Person
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; } = "active";
    public bool DoNotCall { get; set; }
    public string? DoNotCallReason { get; set; }

    public string FullName { get; set; } = "";
    public string Cpf { get; set; } = "";
    public string Rg { get; set; } = "";
    public string IssuingAgency { get; set; } = "";
    public string IssueDate { get; set; } = "";
    public string BirthDate { get; set; } = "";
    public string Sex { get; set; } = "";
    public string RaceColor { get; set; } = "";
    public string Birthplace { get; set; } = "";
    public string FatherName { get; set; } = "";
    public string MotherName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";

    public string Street { get; set; } = "";
    public string Neighborhood { get; set; } = "";
    public string City { get; set; } = "";
    public string Region { get; set; } = "";
    public string ZipCode { get; set; } = "";

    public string VoterId { get; set; } = "";
    public string VoterZone { get; set; } = "";
    public string VoterSection { get; set; } = "";
    public string WorkCard { get; set; } = "";
    public string WorkCardIssueDate { get; set; } = "";
    public string Pis { get; set; } = "";
    public string MilitaryCert { get; set; } = "";

    public string AccountType { get; set; } = "";
    public string BankAgency { get; set; } = "";
    public string AccountNumber { get; set; } = "";
    public string Bank { get; set; } = "";
    public string PixKey { get; set; } = "";

    public bool HasChildren { get; set; }
    public int ChildrenCount { get; set; }
    public List<Child> Children { get; set; } = new();

    public string? PhotoUrl { get; set; }
}

public record Child(string Name, string BirthDate);
