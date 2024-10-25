using System.ComponentModel.DataAnnotations;
using Aibidia.Homework.Application.Resumes.Dtos;
using Aibidia.Homework.Domain.Models;
using AutoMapper;

namespace Aibidia.Homework.Application.Resumes.Mapping;

public class JobPositionProfile : Profile
{
    public JobPositionProfile()
    {
        CreateMap<JobPosition, JobPositionDto>()
            .ForMember(dest => dest.Department, opt => opt.MapFrom(src => GetEnumDisplayName(src.Department)))
            .ForMember(dest => dest.EmploymentType, opt => opt.MapFrom(src => GetEnumDisplayName(src.EmploymentType)))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => GetEnumDisplayName(src.Status)));
    }

    // Helper method to get Display Name of enum members
    private static string GetEnumDisplayName<TEnum>(TEnum enumValue) where TEnum : Enum
    {
        var displayAttribute = typeof(TEnum)
            .GetMember(enumValue.ToString())
            .First()
            .GetCustomAttributes(false)
            .OfType<DisplayAttribute>()
            .FirstOrDefault();

        return displayAttribute?.Name ?? enumValue.ToString();
    }
}