using Aibidia.Homework.Application.Resumes.Dtos;

namespace Aibidia.Homework.Application.Services;

public interface IResumeService
{
    /// <summary>
    /// Gets the list of resumes from the database,
    /// and maps them to a list of ResumeDtos
    /// </summary>
    /// <returns>List of ResumeDtos</returns>
    Task<IEnumerable<ResumeDto>> GetAllResumesAsync();

}