using Aibidia.Homework.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Aibidia.Homework.API.Filters;

public class ExceptionHandlingAttribute : ExceptionFilterAttribute
{
    public ExceptionHandlingAttribute()
    {
    }

    public override void OnException(ExceptionContext context)
    {
        switch (context.Exception)
        {
            case NotFoundException:
                SetErrorResponse(StatusCodes.Status404NotFound, context);
                break;
            case ValidationException:
                SetErrorResponse(StatusCodes.Status400BadRequest, context);
                break;
            case ConflictException:
                SetErrorResponse(StatusCodes.Status409Conflict, context);
                break;
            case UnauthorizedAccessException:
                SetErrorResponse(StatusCodes.Status401Unauthorized, context);
                break;
            case ExternalServiceException exception:
                SetErrorResponse(exception.StatusCode, context);
                break;
            default:
                SetErrorResponse(StatusCodes.Status500InternalServerError, context);
                break;
        }
    }

    private void SetErrorResponse(int statusCode, ExceptionContext context)
    {
        var message = statusCode == StatusCodes.Status500InternalServerError ?
            "Internal server error." : context.Exception.Message;

#if DEBUG
        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            message = context.Exception.Message;
        }
#endif

        context.Result = new ObjectResult(message)
        {
            StatusCode = statusCode
        };
    }
}
