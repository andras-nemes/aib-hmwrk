using Aibidia.Homework.DataAccess.Context;
using Aibidia.Homework.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Aibidia.Homework.DataAccess.Repositories;

public class ResumeRepository : IResumeRepository
{
    private readonly IApplicationDbContext _context;

    public ResumeRepository(IApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<IEnumerable<Resume>> GetAllAsync()
    {
        return await _context.Resumes
            .Include(r => r.JobPosition)
            .Include(r => r.QuestionAnswers)
                .ThenInclude(qa => qa.Question)
            .ToListAsync();
    }
}