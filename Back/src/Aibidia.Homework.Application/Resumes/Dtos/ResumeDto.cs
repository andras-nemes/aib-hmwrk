namespace Aibidia.Homework.Application.Resumes.Dtos;

public record ResumeDto
{
    public string Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string LinkedInUrl { get; set; }
    public string ResumeFilePath { get; set; }
    public bool AllowDataProcessing { get; set; }
    public string? Description { get; set; }
    
    public JobPositionDto JobPosition { get; set; }
    
    /// <summary>
    /// Dictionary containing the application questions that the resume was submitted to, and their true/false answers
    /// </summary>
    public Dictionary<string, bool> QuestionAnswers { get; set; }
}
