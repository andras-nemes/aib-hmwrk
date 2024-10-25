using Aibidia.Homework.Application.Resumes.Dtos;
using Aibidia.Homework.DataAccess.Repositories;
using AutoMapper;

namespace Aibidia.Homework.Application.Services;

public class ResumeService : IResumeService
{
    private readonly IResumeRepository _resumeRepository;
    private readonly IMapper _mapper;

    public ResumeService(IResumeRepository resumeRepository, IMapper mapper)
    {
        _resumeRepository = resumeRepository;
        _mapper = mapper;
    }
    
    public async Task<IEnumerable<ResumeDto>> GetAllResumesAsync()
    {
        var resumes = await _resumeRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<ResumeDto>>(resumes);
    }
}