using Aibidia.Homework.Application.Resumes.Dtos;
using Aibidia.Homework.Domain.Models;
using AutoMapper;

namespace Aibidia.Homework.Application.Resumes.Mapping;

public class ResumeProfile : Profile
{
    public ResumeProfile()
    {
        CreateMap<Resume, ResumeDto>()
            .ForMember(dest => dest.JobPosition,
                opt => opt.MapFrom(src => src.JobPosition))
            .ForMember(dest => dest.QuestionAnswers,
                opt => opt.MapFrom(src => src.QuestionAnswers.ToDictionary(qa => qa.Question.Text, qa => qa.Answer)));
    }
}