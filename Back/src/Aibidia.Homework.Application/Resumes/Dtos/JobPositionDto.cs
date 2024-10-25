namespace Aibidia.Homework.Application.Resumes.Dtos;

public class JobPositionDto
{
    public int Id { get; set; }
    public string JobTitle { get; set; }
    public string? Description { get; set; }
    public string Location { get; set; }
    public string Department { get; set; }
    public string EmploymentType { get; set; }
    public string Status { get; set; }
}