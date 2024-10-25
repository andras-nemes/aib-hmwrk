using Aibidia.Homework.Domain.Models;

namespace Aibidia.Homework.DataAccess.Repositories;

public interface IResumeRepository
{
    /// <summary>
    /// Gets the list of resumes from the database.
    /// The resume objects include the job position that the resume was submitted for,
    /// and the Application answers (QuestionAnswers) that were on the application
    /// </summary>
    /// <returns>List of resumes</returns>
    Task<IEnumerable<Resume>> GetAllAsync();
}